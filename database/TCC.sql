CREATE DATABASE TCC
USE TCC

CREATE TABLE CONDOMINIO (
	COND_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_CONDOMINIO_ID PRIMARY KEY,
	COND_STR_NOME VARCHAR(25) NOT NULL,
	COND_STR_END VARCHAR(50) NOT NULL,
	COND_INT_APTOS INT NOT NULL,
	COND_STR_CARAC VARCHAR(1) NOT NULL
)

CREATE TABLE MORADOR (
	MOR_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_MORADOR_ID PRIMARY KEY,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_MORADOR_CONDOMINIO REFERENCES CONDOMINIO,
	MOR_STR_NOME VARCHAR(50) NOT NULL,
	MOR_STR_LGN VARCHAR(50) NOT NULL,
	MOR_STR_PSW VARCHAR(100) NOT NULL,
	MOR_STR_CEL VARCHAR(11),
	MOR_DT_ING DATE NOT NULL,
	MOR_BIT_ATIVO BIT NOT NULL,
	MOR_BIT_REP BIT NOT NULL,
	MOR_BIT_SIN BIT NOT NULL,
	MOR_STR_PSWRTOKEN VARCHAR(100),
	MOR_DT_PSWREXP DATE,
	MOR_INT_PSWPORTA INT NOT NULL,
	MOR_STR_IMG VARCHAR(150),
)

CREATE TABLE LOGGER ( 
	LOG_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_LOGGER_ID PRIMARY KEY,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_LOGGER_CONDOMINIO REFERENCES CONDOMINIO,
	LOG_STR_MSG VARCHAR(320) NOT NULL,
	LOG_DT_EMI DATETIME NOT NULL,
)

CREATE TABLE BLOCO (  
	BLO_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_BLOCO_ID PRIMARY KEY,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_BLOCO_CONDOMINIO REFERENCES CONDOMINIO,
	BLO_STR_NOME VARCHAR(25),
)

CREATE TABLE APARTAMENTO (
	APTO_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_APARTAMENTO_ID PRIMARY KEY,
	MOR_INT_ID INT CONSTRAINT FK_APARTAMENTO_MORADOR REFERENCES MORADOR,
	BLO_INT_ID INT NOT NULL CONSTRAINT FK_APARTAMENTO_BLOCO REFERENCES BLOCO,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_APARTAMENTO_CONDOMINIO REFERENCES CONDOMINIO,
	APTO_INT_NUM INT NOT NULL,
	APTO_INT_AND INT,
)

CREATE TABLE LOCAIS ( 
	LOC_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_LOCAIS_ID PRIMARY KEY,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_LOCAIS_CONDOMINIO REFERENCES CONDOMINIO,
	LOC_STR_NOME VARCHAR(25) NOT NULL,
	LOC_INT_QTDE INT NOT NULL,
	LOC_STR_DESC VARCHAR(320) NOT NULL,
)

CREATE TABLE DESPESAS ( 
	DESP_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_DESPESAS_ID PRIMARY KEY,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_DESPESAS_CONDOMINIO REFERENCES CONDOMINIO,
	DESP_DT_DATA DATE NOT NULL,
	DESP_NM_VAL NUMERIC(10,2) NOT NULL,
	DESP_STR_DESC VARCHAR(200) NOT NULL,
)

CREATE TABLE FUNCIONARIO ( 
	FUNC_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_FUNCIONARIO_ID PRIMARY KEY,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_FUNCIONAIRO_CONDOMINIO REFERENCES CONDOMINIO,
	FUNC_STR_NOME VARCHAR(50) NOT NULL,
	FUNC_DT_ADMIS DATE NOT NULL,
	FUNC_STR_CEL VARCHAR(11) NOT NULL,
	FUNC_STR_CARGO VARCHAR(50) NOT NULL,
	FUNC_STR_EMPR VARCHAR(50),
)

CREATE TABLE VISITAS ( 
	VSIT_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_VISITAS_ID PRIMARY KEY,
	MOR_INT_ID INT NOT NULL CONSTRAINT FK_VISITAS_MORADOR REFERENCES MORADOR,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_VISITAS_CONDOMINIO REFERENCES CONDOMINIO,
	VSIT_STR_NOME VARCHAR(25) NOT NULL,
	VSIT_DT_ENT DATETIME NOT NULL,
	VSIT_DT_SAI DATETIME NOT NULL,
)

CREATE TABLE RESERVAS ( 
	RES_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_RESERVAS_ID PRIMARY KEY,
	MOR_INT_ID INT NOT NULL CONSTRAINT FK_RESERVAS_MORADOR REFERENCES MORADOR,
	LOC_INT_ID INT NOT NULL CONSTRAINT FK_RESERVAS_LOCAIS REFERENCES LOCAIS,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_RESERVAS_CONDOMINIO REFERENCES CONDOMINIO,
	RES_DT_CMC DATETIME NOT NULL,
	RES_DT_TER DATETIME NOT NULL,
	RES_INT_QTDE INT NOT NULL,
)

CREATE TABLE COMUNICADOS (
	COMU_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_COMU_ID PRIMARY KEY,
	MOR_INT_ID INT NOT NULL CONSTRAINT FK_COMUNICADOS_MORADOR REFERENCES MORADOR,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_COMUNICADOS_CONDOMINIO REFERENCES CONDOMINIO,
	COMU_STR_TIT VARCHAR(50) NOT NULL,
	COMU_STR_DESC VARCHAR(600) NOT NULL,
	COMU_DT_DATA DATETIME NOT NULL,
)

CREATE TABLE ASSISTENCIA (
	AST_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_ASSISTENCIA_ID PRIMARY KEY,
	MOR_INT_ID INT NOT NULL CONSTRAINT FK_ASSISTENCIA_MORADOR REFERENCES MORADOR,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_ASSISTENCIA_CONDOMINIO REFERENCES CONDOMINIO,
	AST_DT_DATA DATETIME NOT NULL,
	AST_STR_TIT VARCHAR(50) NOT NULL,
	AST_STR_DESC VARCHAR(320) NOT NULL,
	AST_STR_TIPO VARCHAR(25) NOT NULL,
)

CREATE TABLE IMPOSTO (
	IMP_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_IMPOSTO_ID PRIMARY KEY,
	APTO_INT_ID INT NOT NULL CONSTRAINT FK_IMPOSTO_APARTAMENTO REFERENCES APARTAMENTO,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_IMPOSTO_CONDOMINIO REFERENCES CONDOMINIO,
	IMP_DT_DATA DATE NOT NULL,
	IMP_NM_VAL NUMERIC(10,2) NOT NULL,
	IMP_STR_DESC VARCHAR(320) NOT NULL,
)

CREATE TABLE VAGAS ( 
	VAG_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_VAGAS_ID PRIMARY KEY,
	APTO_INT_ID INT NOT NULL CONSTRAINT FK_VAGAS_APARTAMENTO REFERENCES APARTAMENTO,
	BLO_INT_ID INT NOT NULL CONSTRAINT FK_VAGAS_BLOCO REFERENCES BLOCO,
	VAG_STR_NUM VARCHAR(15) NOT NULL,
)

CREATE TABLE MENSAGENS (
	MSG_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_MENSAGEM_ID PRIMARY KEY,
	MOR_INT_ID INT NOT NULL CONSTRAINT FK_MENSAGENS_MORADOR REFERENCES MORADOR,
	MSG_STR_DESC VARCHAR(320) NOT NULL,
	MSG_DT_DATA DATETIME NOT NULL,
	MSG_INT_DEST INT NOT NULL
)

CREATE TABLE CONTATO (
	CONT_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_CONTATO_ID PRIMARY KEY,
	CONT_STR_NOME VARCHAR(25) NOT NULL,
	CONT_STR_EMAIL VARCHAR(50) NOT NULL,
	CONT_STR_END VARCHAR(50),
	CONT_INT_APTOS INT,
	CONT_STR_DESC VARCHAR(500) NOT NULL
)

CREATE TABLE RECLAMACAO (
	REC_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_REClAMACAO_ID PRIMARY KEY,
	MOR_INT_ID INT NOT NULL CONSTRAINT FK_RECLAMACAO_MORADOR REFERENCES MORADOR,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_SUGESTAO_CONDOMINIO REFERENCES CONDOMINIO,
	REC_STR_TIT VARCHAR(50) NOT NULL,
	REC_DT_DATA DATETIME NOT NULL,
	REC_STR_TIPO VARCHAR(25) NOT NULL,
	REC_STR_DESC VARCHAR(600) NOT NULL
)

CREATE TABLE SUGESTAO (
	SUGE_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_SUGESTAO_ID PRIMARY KEY,
	MOR_INT_ID INT NOT NULL CONSTRAINT FK_SUGESTAO_MORADOR REFERENCES MORADOR,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_SUGESTAO_CONDOMINIO REFERENCES CONDOMINIO,
	SUGE_STR_TIT VARCHAR(50) NOT NULL,
	SUGE_STR_TIPO VARCHAR(25) NOT NULL,
	SUGE_STR_DESC VARCHAR(600) NOT NULL,
	SUGE_DT_DATA DATETIME NOT NULL,
)

CREATE TABLE REGRAS (
	REG_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_REGRAS_ID PRIMARY KEY,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_REGRAS_CONDOMINIO REFERENCES CONDOMINIO,
	REG_STR_DESC VARCHAR(100) NOT NULL
)

CREATE TABLE VOTACAO ( 
	VOT_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_VOTACAO_ID PRIMARY KEY,
	MOR_INT_ID INT NOT NULL CONSTRAINT FK_VOTACAO_MORADOR REFERENCES MORADOR,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_VOTACAO_CONDOMINIO REFERENCES CONDOMINIO,
	VOT_STR_TITULO VARCHAR(25) NOT NULL,
	VOT_STR_DESC VARCHAR(150) NOT NULL,
	VOT_DT_DATA DATETIME NOT NULL,
)

CREATE TABLE VOTO ( 
	VOTO_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_VOTO_ID PRIMARY KEY,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_VOTO_CONDOMINIO REFERENCES CONDOMINIO,
	MOR_INT_ID INT NOT NULL CONSTRAINT FK_VOTO_MORADOR REFERENCES MORADOR,
	VOT_INT_ID INT NOT NULL CONSTRAINT FK_VOTO_VOTACAO REFERENCES VOTACAO,
	VOTO_BIT_OPCAO BIT
)


CREATE TABLE POST (
	POST_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_POST_ID PRIMARY KEY,
	MOR_INT_ID INT NOT NULL CONSTRAINT FK_POST_MORADOR REFERENCES MORADOR,
	COND_INT_ID INT NOT NULL CONSTRAINT FK_POST_CONDOMINIO REFERENCES CONDOMINIO,
	POST_DT_DATA DATETIME NOT NULL,
	POST_STR_DESC VARCHAR(500) NOT NULL
)

CREATE TABLE SEGUIDORES (
	SEG_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_SEGUIDORES_ID PRIMARY KEY,
	MOR_INT_ID INT NOT NULL CONSTRAINT FK_SEGUIDORES_MORADOR REFERENCES MORADOR,
	SEG_INT_MOR INT NOT NULL,
)

CREATE TABLE EVENTO (
	EVE_INT_ID INT IDENTITY(1,1) CONSTRAINT PK_EVENTO_ID PRIMARY KEY
	COND_INT_ID INT NOT NULL CONSTRAINT FK_EVENTO_CONDOMINIO REFERENCES CONDOMINIO,
	EVE_STR_TIT VARCHAR(50) NOT NULL,
	EVE_STR_DESC VARCHAR(600) NOT NULL,
	EVE_DT_DATA DATETIME NOT NULL,
)