/*
    Retorna oa dados de produção correspondentes a atividade
*/
SELECT a.unidade_trabalho_id, a.etapa_id, u.id as usuario_id, u.nome_guerra, s.id as subfase_id, s.nome as subfase_nome, ut.epsg, 
ST_ASEWKT(ST_Transform(ut.geom,ut.epsg::integer)) as unidade_trabalho_geom, s.fase_id,
ut.nome as unidade_trabalho_nome, bd.nome AS nome_bd, bd.servidor, bd.porta, e.tipo_etapa_id, te.nome as etapa_nome, a.observacao as observacao_atividade,
e.observacao AS observacao_etapa, ut.observacao AS observacao_unidade_trabalho, s.observacao AS observacao_subfase
FROM macrocontrole.atividade as a
INNER JOIN macrocontrole.etapa as e ON e.id = a.etapa_id
INNER JOIN dominio.tipo_etapa as te ON te.code = e.tipo_etapa_id
INNER JOIN macrocontrole.subfase as s ON s.id = e.subfase_id
INNER JOIN macrocontrole.unidade_trabalho as ut ON ut.id = a.unidade_trabalho_id
LEFT JOIN macrocontrole.banco_dados AS bd ON bd.id = ut.banco_dados_id
LEFT JOIN dgeo.usuario AS u ON u.id = a.usuario_id
WHERE a.id = $1