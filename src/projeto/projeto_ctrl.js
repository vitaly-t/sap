"use strict";

const { db } = require("../database");

const { AppError, httpCode } = require("../utils");

const qgisProject = require("./qgis_project");

const { managePermissions } = require("../database");

const {
  checkFMEConnection,
  validadeParameters
} = require("../gerenciador_fme");

const controller = {};

const getUsuarioNomeById = async usuarioId => {
  const usuario = await t.one(
    `SELECT tpg.nome_abrev || ' ' || u.nome_guerra as posto_nome FROM dgeo.usuario as u
    INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id
    WHERE u.id = $<usuarioId>`,
    { usuarioId }
  );
  return usuario.posto_nome;
};

controller.getEstilos = async () => {
  return db.sapConn.any(`SELECT * FROM dgeo.layer_styles`);
};

controller.getRegras = async () => {
  return db.sapConn.any(`SELECT * FROM dgeo.layer_rules`);
};

controller.getModelos = async () => {
  return db.sapConn.any(`SELECT * FROM dgeo.layer_qgis_models`);
};

controller.getMenus = async () => {
  return db.sapConn.any(`SELECT * FROM dgeo.layer_menus`);
};

controller.gravaEstilos = async (estilos, usuarioId) => {
  const dataGravacao = new Date();
  await db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId);

    await t.none(`TRUNCATE dgeo.layer_styles RESTART IDENTITY`);

    const table = new db.pgp.helpers.TableName({
      table: "layer_styles",
      schema: "dgeo"
    });

    const cs = new db.pgp.helpers.ColumnSet(
      [
        "f_table_schema",
        "f_table_name",
        "f_geometry_column",
        "stylename",
        "styleqml",
        "stylesld",
        "ui",
        "owner",
        "update_time"
      ],
      { table }
    );

    const values = [];
    estilos.forEach(d => {
      values.push({
        f_table_schema: d.f_table_schema,
        f_table_name: d.f_table_name,
        f_geometry_column: d.f_geometry_column,
        stylename: d.stylename,
        styleqml: d.styleqml,
        stylesld: stylesld,
        ui: ui,
        owner: usuarioPostoNome,
        update_time: dataGravacao
      });
    });

    const query = db.pgp.helpers.insert(values, cs);

    await t.none(query);
  });
};

controller.grava_regras = async (regras, usuarioId) => {
  const dataGravacao = new Date();
  await db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId);

    await t.none(`TRUNCATE dgeo.layer_rules RESTART IDENTITY`);

    const table = new db.pgp.helpers.TableName({
      table: "layer_rules",
      schema: "dgeo"
    });

    const cs = new db.pgp.helpers.ColumnSet(
      [
        "grupo_regra",
        "tipo_regra",
        "schema",
        "camada",
        "atributo",
        "regra",
        "cor_rgb",
        "descricao",
        "ordem",
        "owner",
        "update_time"
      ],
      { table }
    );

    const values = [];
    regras.forEach(d => {
      values.push({
        grupo_regra: d.grupo_regra,
        tipo_regra: d.tipo_regra,
        schema: d.schema,
        camada: d.camada,
        atributo: d.atributo,
        regra: d.regra,
        cor_rgb: d.cor_rgb,
        descricao: d.descricao,
        ordem: d.ordem,
        owner: usuarioPostoNome,
        update_time: dataGravacao
      });
    });

    const query = db.pgp.helpers.insert(values, cs);

    await t.none(query);
  });
};

controller.grava_modelos = async (modelos, usuarioId) => {
  const dataGravacao = new Date();
  await db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId);

    await t.none(`TRUNCATE dgeo.layer_qgis_models RESTART IDENTITY`);

    const table = new db.pgp.helpers.TableName({
      table: "layer_qgis_models",
      schema: "dgeo"
    });

    const cs = new db.pgp.helpers.ColumnSet(
      ["nome", "descricao", "model_xml", "owner", "update_time"],
      { table }
    );

    const values = [];
    modelos.forEach(d => {
      values.push({
        nome: d.nome,
        descricao: d.descricao,
        model_xml: d.model_xml,
        owner: usuarioPostoNome,
        update_time: dataGravacao
      });
    });

    const query = db.pgp.helpers.insert(values, cs);

    await t.none(query);
  });
};

controller.grava_menus = async (menus, usuarioId) => {
  const dataGravacao = new Date();
  await db.sapConn.tx(async t => {
    const usuarioPostoNome = getUsuarioNomeById(usuarioId);

    await t.none(`TRUNCATE dgeo.layer_menus RESTART IDENTITY`);

    const table = new db.pgp.helpers.TableName({
      table: "layer_menus",
      schema: "dgeo"
    });

    const cs = new db.pgp.helpers.ColumnSet(
      ["nome_menu", "definicao_menu", "ordem_menu", "owner", "update_time"],
      { table }
    );

    const values = [];
    menus.forEach(d => {
      values.push({
        nome_menu: d.nome_menu,
        definicao_menu: d.definicao_menu,
        ordem_menu: d.ordem_menu,
        owner: usuarioPostoNome,
        update_time: dataGravacao
      });
    });

    const query = db.pgp.helpers.insert(values, cs);

    await t.none(query);
  });
};

controller.getProject = async () => {
  return qgisProject;
};

controller.criaUsuarios = async ({
  nome,
  nome_guerra,
  tipo_turno_id,
  tipo_posto_grad_id,
  uuid
}) => {
  await db.sapConn.none(
    `INSERT INTO dgeo.usuario(nome, nome_guerra, administrador, ativo, tipo_turno_id, tipo_posto_grad_id, uuid)
  VALUES ($<nome>, $<nome_guerra>, FALSE, TRUE, $<tipo_turno_id>, $<tipo_posto_grad_id>, $<uuid>`,
    { nome, nome_guerra, tipo_turno_id, tipo_posto_grad_id, uuid }
  );
};

controller.getBancoDados = async () => {
  return db.sapConn.any(
    `SELECT nome, servidor, porta FROM macrocontrole.banco_dados`
  );
};

controller.getUsuarios = async () => {
  return db.sapConn.any(
    `SELECT u.id, u.uuid, tpg.nome_abrev || ' ' || u.nome_guerra AS nome
    FROM dgeo.usuario AS u INNER JOIN dominio.tipo_posto_grad AS tpg ON tpg.code = u.tipo_posto_grad_id WHERE u.ativo IS TRUE`
  );
};

controller.criaRevisao = async unidadeTrabalhoIds => {
  await db.sapConn.tx(async t => {
    for (let unidadeTrabalhoId of unidadeTrabalhoIds) {
      //refactor to batch
      const ordemEtapa = await t.one(
        `SELECT ut.subfase_id, max(e.ordem) AS ordem 
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
        WHERE ut.id = $<unidadeTrabalhoId>
        GROUP BY ut.subfase_id`,
        { unidadeTrabalhoId }
      );
      const etapaRev = await t.oneOrNone(
        `SELECT e.id FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
        LEFT JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id AND a.etapa_id = e.id
        WHERE ut.id = $<unidadeTrabalhoId> AND a.id IS NULL AND e.tipo_etapa_id = 2
        ORDER BY e.ordem
        LIMIT 1`,
        { unidadeTrabalhoId }
      );
      const etapaCorr = await t.oneOrNone(
        `SELECT e.id FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
        LEFT JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id AND a.etapa_id = e.id
        WHERE ut.id = $<unidadeTrabalhoId> AND a.id IS NULL AND e.tipo_etapa_id = 3
        ORDER BY e.ordem
        LIMIT 1`,
        { unidadeTrabalhoId }
      );
      let ids;
      if (etapaRev && etapaCorr) {
        ids = [];
        ids.push(etapaRev);
        ids.push(etapaCorr);
      } else {
        // cria novas etapas
        ids = await t.any(
          `
        INSERT INTO macrocontrole.etapa(tipo_etapa_id, subfase_id, ordem)
        VALUES(2,$<subfaseId>,$<ordem1>),(3,$<subfaseId>,$<ordem2>) RETURNING id
        `,
          {
            subfaseId: ordemEtapa.subfase_id,
            ordem1: ordemEtapa.ordem + 1,
            ordem2: ordemEtapa.ordem + 2
          }
        );
      }
      await t.none(
        `
      INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
      VALUES ($<idRev>,$<unidadeTrabalhoId>,1),($<idCorr>,$<unidadeTrabalhoId>,1)
      `,
        { idRev: ids[0].id, idCorr: ids[1].id, unidadeTrabalhoId }
      );
    }
  });
};

controller.criaRevcorr = async unidadeTrabalhoIds => {
  await db.sapConn.tx(async t => {
    for (let unidadeTrabalhoId of unidadeTrabalhoIds) {
      //refactor to batch
      const ordemEtapa = await t.one(
        `SELECT ut.subfase_id, max(e.ordem) AS ordem 
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
        WHERE ut.id = $<unidadeTrabalhoId>
        GROUP BY ut.subfase_id`,
        { unidadeTrabalhoId }
      );
      const etapaRevcorr = await t.oneOrNone(
        `SELECT e.id FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
        LEFT JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id AND a.etapa_id = e.id
        WHERE ut.id = $<unidadeTrabalhoId> AND a.id IS NULL AND e.tipo_etapa_id = 4
        ORDER BY e.ordem
        LIMIT 1`,
        { unidadeTrabalhoId }
      );
      const revcorr =
        etapaRevcorr ||
        (await t.one(
          `
        INSERT INTO macrocontrole.etapa(tipo_etapa_id, subfase_id, ordem)
        VALUES(4,$<subfaseId>,$<ordem>) RETURNING id
        `,
          { subfaseId: ordemEtapa.subfase_id, ordem: ordemEtapa.ordem + 1 }
        ));
      await t.none(
        `
      INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
      VALUES ($<idRevCorr>,$<unidadeTrabalhoId>,1)
      `,
        { idRevCorr: revcorr.id, unidadeTrabalhoId }
      );
    }
  });
};

controller.getLotes = async () => {
  return db.sapConn.any(`SELECT id, nome FROM macrocontrole.lote`);
};

controller.unidadeTrabalhoLote = async (unidadeTrabalhoIds, lote) => {
  return db.sapConn.none(
    `UPDATE macrocontrole.unidade_trabalho
    SET lote = $<lote>
    WHERE id in ($<unidadeTrabalhoIds:csv>)`,
    { unidadeTrabalhoIds, lote }
  );
};

controller.deletaAtividades = async atividadeIds => {
  return db.sapConn.none(
    `
  DELETE FROM macrocontrole.atividade
  WHERE id in ($<atividadeIds:csv>) AND tipo_situacao IN (1,3)
  `,
    { atividadeIds }
  );
};

controller.criaAtividades = async (unidadeTrabalhoIds, etapaId) => {
  const result = await db.sapConn.result(
    `
  INSERT INTO macrocontrole.atividade(etapa_id, unidade_trabalho_id, tipo_situacao_id)
  SELECT DISTINCT $<etapaId> AS etapa_id, ut.id AS unidade_trabalho_id, 1 AS tipo_situacao_id
  FROM macrocontrole.unidade_trabalho AS ut
  INNER JOIN macrocontrole.etapa AS e ON e.subfase_id = ut.subfase_id
  LEFT JOIN (
    SELECT id, etapa_id, unidade_trabalho_id FROM macrocontrole.atividade WHERE tipo_situacao_id != 5
    ) AS a ON ut.id = a.unidade_trabalho_id AND a.etapa_id = e.id
  WHERE ut.id IN ($<unidadeTrabalhoIds:csv>) AND e.id = $<etapaId> AND a.id IS NULL
  `,
    { unidadeTrabalhoIds, etapaId }
  );
  if (!result.rowCount || result.rowCount != 1) {
    throw new AppError(
      "As atividades não podem ser criadas pois já existem.",
      httpCode.BadRequest
    );
  }
};

controller.getProjetos = async () => {
  return db.sapConn.any(
    `SELECT id, nome, finalizado FROM macrocontrole.projeto`
  );
};

controller.getLinhasProducao = async () => {
  return db.sapConn.any(
    `SELECT id, nome, projeto_id, tipo_produto_id FROM macrocontrole.linha_producao`
  );
};

controller.getFases = async () => {
  return db.sapConn.any(
    `SELECT f.id, tf.nome, f.tipo_fase_id, f.linha_producao_id, f.ordem
    FROM macrocontrole.fase AS f
    INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id`
  );
};

controller.getSubfases = async () => {
  return db.sapConn.any(
    `SELECT id, nome, fase_id, ordem, observacao FROM macrocontrole.subfase`
  );
};

controller.getEtapas = async () => {
  return db.sapConn.any(
    `SELECT e.id, te.nome, e.tipo_etapa_id, e.subfase_id, e.ordem, e.observacao
    FROM macrocontrole.etapa AS e
    INNER JOIN dominio.tipo_etapa AS te ON te.code = e.tipo_etapa_id`
  );
};

controller.getGerenciadorFME = async () => {
  return db.sapConn.any(
    `SELECT id, servidor, porta
    FROM dgeo.gerenciador_fme`
  );
};

controller.criaGerenciadorFME = async (servidor, porta) => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.gerenciador_fme
      WHERE servidor = $<servidor> AND porta = $<porta>`,
      { servidor, porta }
    );
    if (exists) {
      throw new AppError("O servidor já está cadastrado", httpCode.BadRequest);
    }

    await checkFMEConnection(servidor, porta);

    return t.any(
      `INSERT INTO dgeo.gerenciador_fme(servidor, porta)
      VALUES ($<servidor>, $<porta>)`,
      { servidor, porta }
    );
  });
};

controller.atualizaGerenciadorFME = async (id, servidor, porta) => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.gerenciador_fme
      WHERE id = $<id>`,
      { id }
    );
    if (!exists) {
      throw new AppError(
        "O id informado não corresponde a um servidor do Gerenciador do FME",
        httpCode.BadRequest
      );
    }

    await checkFMEConnection(servidor, porta);

    return t.any(
      `UPDATE dgeo.gerenciador_fme
      SET servidor = $<servidor>, porta =$<porta>
      where id = $<id>`,
      { id, servidor, porta }
    );
  });
};

controller.deletaGerenciadorFME = async id => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM dgeo.gerenciador_fme
      WHERE id = $<id>`,
      { id }
    );
    if (!exists) {
      throw new AppError(
        "O id informado não corresponde a um servidor do Gerenciador do FME",
        httpCode.BadRequest
      );
    }

    const existsAssociation = await t.any(
      `SELECT id FROM macrocontrole.perfil_fme 
      WHERE gerenciador_fme_id = $<id>`,
      { id }
    );
    if (existsAssociation) {
      throw new AppError(
        "O servidor possui rotinas do fme associadas em perfil_fme",
        httpCode.BadRequest
      );
    }

    await checkFMEConnection(servidor, porta);

    return t.any(
      `DELETE FROM dgeo.gerenciador_fme
      WHERE id = $<id>`,
      { id }
    );
  });
};

controller.getCamadas = async () => {
  return db.sapConn.any(
    `SELECT id, schema, nome, alias, documentacao
    FROM macrocontrole.camada`
  );
};

controller.deleteCamadas = async camadasIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.camada
      WHERE id in ($<camadasIds:csv>)`,
      { camadasIds }
    );
    if (!exists) {
      throw new AppError(
        "Os ids informado não correspondem a uma camada",
        httpCode.BadRequest
      );
    }

    const existsAssociationAtributo = await t.any(
      `SELECT id FROM macrocontrole.atributo 
      WHERE camada_id in ($<camadasIds:csv>)`,
      { camadasIds }
    );
    if (existsAssociationAtributo) {
      throw new AppError(
        "A camada possui atributos associados",
        httpCode.BadRequest
      );
    }
    const existsAssociationPerfil = await t.any(
      `SELECT id FROM macrocontrole.perfil_propriedades_camada 
      WHERE camada_id in ($<camadasIds:csv>)`,
      { camadasIds }
    );
    if (existsAssociationPerfil) {
      throw new AppError(
        "A camada possui perfil propriedades camadas associados",
        httpCode.BadRequest
      );
    }

    return t.any(
      `DELETE FROM macrocontrole.camada
      WHERE id IN ($<camadasIds:csv>)`,
      { camadasIds }
    );
  });
};

controller.atualizaCamadas = async camadas => {
  return db.sapConn.tx(async t => {
    const exists = await t.any(
      `SELECT id FROM macrocontrole.camada
      WHERE id in ($<camadasIds:csv>)`,
      { camadasIds }
    );
    if (!exists) {
      throw new AppError(
        "Os ids informado não correspondem a uma camada",
        httpCode.BadRequest
      );
    }
    const query = [];
    camadas.forEach(c => {
      const { id, schema, nome, alias, documentacao } = c;

      query.push(
        t.any(
          `UPDATE macrocontrole.camada
          SET schema = $<schema>, nome = $<nome>, alias = $<alias>, documentacao = $<documentacao>
          where id = $<id>`,
          { id, schema, nome, alias, documentacao }
        )
      );
    });

    await t.batch(query);

    //update all permissions
    await managePermissions.revokeAndGrantAllExecution();
  });
};

controller.criaCamadas = async camadas => {
  const table = new db.pgp.helpers.TableName({
    table: "camada",
    schema: "macrocontrole"
  });

  const cs = new db.pgp.helpers.ColumnSet(
    ["schema", "nome", "alias", "documentacao"],
    {
      table
    }
  );

  const query = db.pgp.helpers.insert(camadas, cs);

  db.sapConn.none(query);
};

module.exports = controller;
