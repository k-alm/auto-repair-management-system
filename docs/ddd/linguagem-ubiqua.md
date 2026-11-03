# Linguagem Ubíqua e Glossário do Domínio
 
Vocabulário compartilhado entre negócio (oficina) e código do **Auto Repair Management System**.
Os termos em português são os usados nas conversas e no Event Storming; a coluna **No código** mostra o nome correspondente na implementação (tabelas, enums, classes, rotas).
 
> Convenção: os nomes técnicos do código (módulos, classes, enums, rotas) estão em inglês, exceto os valores de status da OS, que são mantidos em português por serem termos do negócio.
 
---
 
## 1. Contextos delimitados (Bounded Contexts)
 
| Contexto | Responsabilidade | Módulos no código |
|---|---|---|
| **Gestão de Clientes e Veículos** | Cadastro e consulta de clientes (CPF/CNPJ) e de seus veículos (placa) | `customers`, `vehicles` |
| **Ordens de Serviço** | Abertura da OS, orçamento, aprovação, acompanhamento de status, execução e entrega | `work-orders`, `quotes`, `public-tracking`, `reports` |
| **Catálogo de Serviços e Peças** | Serviços oferecidos, peças/insumos e controle de estoque | `services`, `parts` |
| **Identidade e Acesso** | Funcionários, perfis e autenticação | `authentication`, `employees` |
| **Notificações** *(suporte)* | Envio de e-mails ao cliente (outbox + worker) | `src/shared/infrastructure` |
 
---
 
## 2. Atores
 
| Termo | Definição | No código |
|---|---|---|
| **Cliente** | Pessoa física ou jurídica dona do veículo. Acompanha a OS e aprova/rejeita o orçamento por link individual, sem login. | `Customer`; acesso público por token |
| **Atendente** | Funcionário que recebe o cliente, cadastra clientes/veículos, abre a OS e entrega o veículo. | `EmployeeRole.ATTENDANT` |
| **Mecânico** | Funcionário que diagnostica, inclui serviços/peças, executa e finaliza a OS. | `EmployeeRole.MECHANIC` |
| **Administrador** | Funcionário com acesso total, incluindo gestão de funcionários, catálogo e estoque. | `EmployeeRole.ADMIN` |
 
---
 
## 3. Glossário de termos do domínio
 
### 3.1 Clientes e veículos
 
| Termo | Definição | No código |
|---|---|---|
| **Cliente** | Pessoa que contrata os serviços da oficina; identificada por CPF ou CNPJ. | `Customer`, tabela `customers` |
| **Documento do cliente** | CPF (11 dígitos) ou CNPJ (14 dígitos) válido, armazenado somente com números. É único por cliente. | VO `CustomerDocument` |
| **Veículo** | Automóvel do cliente atendido pela oficina (placa, marca, modelo e ano). | `Vehicle`, tabela `vehicles` |
| **Placa** | Identificação única do veículo, no padrão antigo (`ABC1234`) ou Mercosul (`ABC1D23`). | VO `VehiclePlate` |
| **Histórico do cliente/veículo** | Conjunto de OS já registradas para o cliente ou o veículo. | `WorkOrder` ligada a `customerId`/`vehicleId` |
 
### 3.2 Catálogo e estoque
 
| Termo | Definição | No código |
|---|---|---|
| **Serviço** | Trabalho oferecido pela oficina (ex.: troca de óleo, alinhamento), com preço e tempo estimado. | `Service`, tabela `services` |
| **Peça / Insumo** | Item físico usado nos reparos, com SKU, preço e saldo em estoque. | `Part`, tabela `parts` |
| **SKU** | Código único de identificação da peça/insumo. | `Part.sku` |
| **Estoque** | Quantidade disponível de uma peça. Nunca pode ser negativa. | `Part.stockQuantity` |
| **Entrada de estoque** | Acréscimo de quantidade ao saldo de uma peça. | `POST /api/parts/:id/stock/entries` |
| **Ajuste de estoque** | Definição direta do saldo de uma peça. | `PATCH /api/parts/:id/stock` |
| **Baixa de estoque (consumo)** | Desconto da quantidade das peças da OS no momento da aprovação do orçamento. | `consumeOrderParts` |
| **Peça indisponível** | Situação em que o saldo é menor que a quantidade pedida; a operação é recusada. | `WorkOrderInsufficientPartStockError` (409) |
| **Inativar** | Retirar item do catálogo sem apagar o histórico (exclusão lógica). | `deletedAt` / `isActive` |
 
### 3.3 Ordem de Serviço e orçamento
 
| Termo | Definição | No código |
|---|---|---|
| **Ordem de Serviço (OS)** | Registro central do atendimento: cliente, veículo, serviços, peças, orçamento e status. É o agregado principal. | `WorkOrder`, tabela `work_orders` |
| **Item de serviço da OS** | Serviço incluído na OS, com o preço unitário vigente na criação (preço congelado). | `WorkOrderService` |
| **Item de peça da OS** | Peça incluída na OS, com quantidade e preço unitário congelado. | `WorkOrderPart` |
| **Orçamento** | Valor total proposto ao cliente: soma dos serviços + (peças × quantidade). Gerado automaticamente na criação da OS. | `Quote`, tabela `quotes` |
| **Total do orçamento** | Resultado do cálculo em centavos, com duas casas decimais. | `calculateQuoteTotal` |
| **Orçamento preparado** | Orçamento gerado, ainda não enviado ao cliente. | `QuoteStatus.PREPARED` |
| **Orçamento disponibilizado (enviado)** | Orçamento enviado por e-mail, aguardando decisão do cliente. | `QuoteStatus.PENDING` |
| **Orçamento aprovado** | Cliente autorizou a execução. | `QuoteStatus.APPROVED` |
| **Orçamento rejeitado** | Cliente recusou; a OS é cancelada. | `QuoteStatus.REJECTED` |
| **Orçamento expirado** | Prazo de validade vencido sem decisão; a OS é cancelada. | `QuoteStatus.EXPIRED` |
| **Link de aprovação** | URL individual, de uso único e com validade, enviada por e-mail para aprovar/rejeitar o orçamento. | token opaco + hash em `quotes.tokenHash` |
| **Link de acompanhamento** | URL pessoal enviada na abertura da OS para o cliente consultar o andamento. | token opaco + hash em `work_orders.trackingTokenHash` |
| **Autorização** | Registro identificável da decisão do cliente sobre o orçamento. | `Quote.authorizationId` |
 
### 3.4 Status da OS
 
| Status | Significado | No código |
|---|---|---|
| **Recebida** | OS aberta; veículo recebido; orçamento preparado. | `RECEBIDA` |
| **Em diagnóstico** | Mecânico avalia o veículo e define serviços e peças. | `EM_DIAGNOSTICO` |
| **Aguardando aprovação** | Orçamento enviado; esperando a decisão do cliente. | `AGUARDANDO_APROVACAO` |
| **Em execução** | Orçamento aprovado; serviço em andamento; estoque baixado. | `EM_EXECUCAO` |
| **Finalizada** | Serviço concluído; horário de término registrado. | `FINALIZADA` |
| **Entregue** | Veículo devolvido ao cliente. Estado final. | `ENTREGUE` |
| **Cancelada** | OS encerrada por rejeição, expiração do orçamento ou cancelamento. Estado final. | `CANCELADA` |
 
**Transições permitidas**
 
| De | Para |
|---|---|
| Recebida | Em diagnóstico, Cancelada |
| Em diagnóstico | Aguardando aprovação *(ao enviar o orçamento)*, Cancelada |
| Aguardando aprovação | Em execução *(somente pela aprovação do orçamento)*, Cancelada |
| Em execução | Finalizada, Cancelada |
| Finalizada | Entregue |
| Entregue / Cancelada | *(nenhuma)* |
 
### 3.5 Execução e indicadores
 
| Termo | Definição | No código |
|---|---|---|
| **Início da execução** | Momento em que o orçamento é aprovado e a OS entra em execução. | `WorkOrder.startedAt` |
| **Término da execução** | Momento em que a OS é finalizada. | `WorkOrder.finishedAt` |
| **Duração da execução** | Diferença entre término e início, em minutos. | cálculo em `get-average-execution-time` |
| **Tempo médio de execução** | Média das durações das OS finalizadas ou entregues. | `GET /api/reports/average-execution-time` |
 
### 3.6 Segurança e acesso
 
| Termo | Definição | No código |
|---|---|---|
| **Funcionário** | Pessoa da oficina com acesso ao sistema. | `Employee`, tabela `employees` |
| **Perfil (papel)** | Nível de acesso do funcionário: Administrador, Atendente ou Mecânico. | `EmployeeRole` |
| **Token de acesso (JWT)** | Credencial emitida no login para chamar as APIs administrativas. | `accessToken` |
| **Token público** | Segredo aleatório presente nos links enviados ao cliente; o sistema guarda apenas o hash. | `sha256` do token |
| **Notificação** | E-mail registrado para envio ao cliente, com conteúdo criptografado, processado por um worker. | `Notification`, tabela `notifications` |
 
---
 
## 4. Regras de negócio com nome próprio
 
| Regra | Descrição |
|---|---|
| **Documento válido** | CPF/CNPJ precisa passar na validação dos dígitos verificadores; sequências repetidas são recusadas. |
| **Placa válida** | Aceita `AAA9999` e `AAA9A99`; é normalizada para maiúsculas, sem hífen. |
| **Veículo do cliente** | O veículo informado na OS precisa pertencer ao cliente identificado pelo documento. |
| **Itens sem duplicidade** | Serviço ou peça não pode aparecer duas vezes na mesma OS. |
| **Quantidade positiva** | A quantidade de uma peça na OS deve ser um inteiro maior que zero. |
| **Itens ativos** | Somente serviços e peças ativos e não removidos podem entrar na OS. |
| **Estoque suficiente** | A criação da OS e a aprovação do orçamento exigem saldo igual ou maior que a quantidade pedida. |
| **Preço congelado** | O preço unitário usado no orçamento é o do momento da criação da OS. |
| **Envio do orçamento** | Só é possível enviar o orçamento quando a OS está *Em diagnóstico* e o orçamento está *Preparado*. |
| **Decisão única e com prazo** | O link de aprovação vale uma única vez e expira após o prazo configurado. |
| **Execução pela aprovação** | A OS só entra *Em execução* pela aprovação do orçamento, nunca por transição manual. |
| **Rejeição ou expiração cancela** | Orçamento rejeitado ou expirado leva a OS para *Cancelada*. |
