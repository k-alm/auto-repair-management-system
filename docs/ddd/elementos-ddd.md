# Elementos de DDD

Esta documentação reúne os elementos de domínio descritos em
[documentacao-ddd-tech-challenge.drawio.html](../../documentacao-ddd-tech-challenge.drawio.html).
Os nomes de módulos e caminhos de código abaixo refletem o mapeamento apresentado nessa
referência.

## Bounded Contexts

| Contexto | Tipo | Responsabilidade | Agregados | Módulos | Termos próprios |
|---|---|---|---|---|---|
| Gestão de Clientes e Veículos | Suporte | Cadastro e consulta de clientes e veículos | Cliente; Veículo | `customers`; `vehicles` | Documento; Placa |
| Ordens de Serviço | Núcleo (Core) | Atendimento, orçamento, aprovação, execução e entrega | Ordem de Serviço (com Orçamento) | `work-orders`; `quotes`; `public-tracking`; `reports` | OS; Orçamento; Status; Diagnóstico; Execução |
| Catálogo de Serviços e Peças | Suporte | Catálogo de serviços e controle de estoque de peças | Serviço; Peça | `services`; `parts` | SKU; Estoque; Baixa |
| Identidade e Acesso | Genérico | Funcionários, perfis e autenticação JWT | Funcionário | `authentication`; `employees` | Perfil; Token de acesso |
| Notificações | Genérico | Envio assíncrono de e-mails ao cliente | Notificação | `shared/infrastructure` | Outbox; Tentativa |

## Atores

| Ator | Descrição | Contexto(s) | Principais comandos |
|---|---|---|---|
| Cliente | Dono do veículo. Não tem login; acessa por links individuais enviados por e-mail. | Ordens de Serviço | Consultar andamento da OS; aprovar orçamento; rejeitar orçamento |
| Atendente (`ATTENDANT`) | Recebe o cliente, cadastra cliente e veículo, abre a OS e entrega o veículo. | Clientes e Veículos; Ordens de Serviço | Cadastrar e alterar cliente; cadastrar e alterar veículo; abrir OS; registrar entrega |
| Mecânico (`MECHANIC`) | Diagnostica, executa e finaliza a OS. | Ordens de Serviço | Iniciar diagnóstico; enviar orçamento; finalizar OS |
| Administrador (`ADMIN`) | Acesso total; gere catálogo, estoque e funcionários. | Catálogo; Identidade e Acesso | Cadastrar, alterar e inativar serviço ou peça; registrar entrada e ajustar estoque; gerenciar funcionários |
| Sistema (worker de notificações) | Processo automático que envia os e-mails pendentes. | Notificações | Enviar e-mail pendente |

## Comandos

| Comando | Ator | Agregado ou consulta | Endpoint | Resultado/evento descrito |
|---|---|---|---|---|
| Autenticar funcionário | Funcionário | Funcionário | `POST /api/auth/login` | Funcionário autenticado |
| Cadastrar funcionário | Administrador | Funcionário | `POST /api/employees` | Funcionário cadastrado |
| Alterar funcionário | Administrador | Funcionário | `PATCH /api/employees/:id` | Funcionário alterado |
| Inativar funcionário | Administrador | Funcionário | `DELETE /api/employees/:id` | Funcionário inativado |
| Cadastrar cliente | Atendente | Cliente | `POST /api/customers` | Cliente cadastrado |
| Alterar cliente | Atendente | Cliente | `PATCH /api/customers/:id` | Cliente alterado |
| Inativar cliente | Atendente | Cliente | `DELETE /api/customers/:id` | Cliente inativado |
| Cadastrar veículo | Atendente | Veículo | `POST /api/vehicles` | Veículo cadastrado e vinculado ao cliente |
| Alterar veículo | Atendente | Veículo | `PATCH /api/vehicles/:id` | Veículo alterado |
| Inativar veículo | Atendente | Veículo | `DELETE /api/vehicles/:id` | Veículo inativado |
| Cadastrar serviço | Administrador | Serviço | `POST /api/services` | Serviço cadastrado |
| Alterar serviço | Administrador | Serviço | `PATCH /api/services/:id` | Serviço alterado |
| Inativar serviço | Administrador | Serviço | `DELETE /api/services/:id` | Serviço inativado |
| Cadastrar peça/insumo | Administrador | Peça | `POST /api/parts` | Peça cadastrada |
| Alterar peça/insumo | Administrador | Peça | `PATCH /api/parts/:id` | Peça alterada |
| Inativar peça/insumo | Administrador | Peça | `DELETE /api/parts/:id` | Peça inativada |
| Registrar entrada de estoque | Administrador | Peça | `POST /api/parts/:id/stock/entries` | Entrada de estoque registrada |
| Ajustar saldo de estoque | Administrador | Peça | `PATCH /api/parts/:id/stock` | Estoque ajustado |
| Abrir OS com serviços e peças | Atendente | Ordem de Serviço | `POST /api/work-orders` | OS recebida; orçamento gerado; link de acompanhamento enviado ao cliente |
| Iniciar diagnóstico | Mecânico | Ordem de Serviço | `POST /api/work-orders/:id/transitions` (`to=EM_DIAGNOSTICO`) | Diagnóstico iniciado |
| Enviar orçamento ao cliente | Mecânico | Ordem de Serviço e Orçamento | `POST /api/work-orders/:id/quote/send` | Orçamento disponibilizado; OS aguardando aprovação |
| Aprovar orçamento | Cliente | Ordem de Serviço e Orçamento | `POST /api/public/quotes/:id/decision` (`APPROVED`) | Orçamento aprovado; execução iniciada; estoque consumido |
| Rejeitar orçamento | Cliente | Ordem de Serviço e Orçamento | `POST /api/public/quotes/:id/decision` (`REJECTED`) | Orçamento rejeitado; OS cancelada |
| Finalizar OS | Mecânico | Ordem de Serviço | `POST /api/work-orders/:id/transitions` (`to=FINALIZADA`) | OS finalizada; duração registrada |
| Registrar entrega do veículo | Atendente | Ordem de Serviço | `POST /api/work-orders/:id/transitions` (`to=ENTREGUE`) | OS entregue |
| Cancelar OS | Atendente ou Mecânico | Ordem de Serviço | `POST /api/work-orders/:id/transitions` (`to=CANCELADA`) | OS cancelada |
| Consultar andamento da OS | Cliente | Ordem de Serviço (read model) | `GET /api/public/work-orders/:id` (cabeçalho `x-tracking-token`) | Consulta |
| Consultar tempo médio de execução | Administrador | Relatório (read model) | `GET /api/reports/average-execution-time` | Consulta |

## Eventos de domínio

Os eventos abaixo são os resultados de domínio identificados na referência. No código, são
representados por mudanças de estado e pelo enfileiramento de notificações (outbox); não há
barramento de eventos.

| Evento | Disparado por | Efeito no modelo | Contexto |
|---|---|---|---|
| Cliente cadastrado | Cadastrar cliente | Cliente criado com documento válido e único | Clientes e Veículos |
| Cliente alterado | Alterar cliente | Dados do cliente atualizados | Clientes e Veículos |
| Cliente inativado | Inativar cliente | Exclusão lógica (`deletedAt`) | Clientes e Veículos |
| Veículo cadastrado e vinculado ao cliente | Cadastrar veículo | Veículo criado com placa válida e única | Clientes e Veículos |
| Veículo alterado | Alterar veículo | Dados do veículo atualizados | Clientes e Veículos |
| Serviço cadastrado | Cadastrar serviço | Serviço criado com preço não negativo | Catálogo |
| Serviço alterado | Alterar serviço | Dados do serviço atualizados | Catálogo |
| Serviço inativado | Inativar serviço | Serviço deixa de poder entrar em novas OS | Catálogo |
| Peça cadastrada | Cadastrar peça | Peça criada com SKU único e saldo inicial maior ou igual a zero | Catálogo |
| Peça alterada | Alterar peça | Dados atualizados sem alterar o saldo | Catálogo |
| Peça inativada | Inativar peça | Peça deixa de poder entrar em novas OS | Catálogo |
| Entrada de estoque registrada | Registrar entrada de estoque | Saldo aumenta pela quantidade informada | Catálogo |
| Estoque ajustado | Ajustar saldo | Saldo substituído pelo valor informado | Catálogo |
| OS recebida | Abrir OS | OS criada com status `RECEBIDA`; preços congelados | Ordens de Serviço |
| Orçamento gerado | Abrir OS | Orçamento criado com status `PREPARED` e total calculado | Ordens de Serviço |
| Link de acompanhamento enviado | Abrir OS | E-mail com link pessoal enfileirado | Ordens de Serviço / Notificações |
| Peça indisponível (recusa) | Abrir OS ou aprovar orçamento | Operação recusada com erro 409 por estoque insuficiente | Ordens de Serviço |
| Diagnóstico iniciado | Iniciar diagnóstico | Status `RECEBIDA` → `EM_DIAGNOSTICO` | Ordens de Serviço |
| Orçamento disponibilizado | Enviar orçamento | Orçamento `PREPARED` → `PENDING`; token com validade; OS → `AGUARDANDO_APROVACAO`; e-mail enfileirado | Ordens de Serviço |
| Orçamento aprovado | Aprovar orçamento | Orçamento `PENDING` → `APPROVED` | Ordens de Serviço |
| Execução iniciada | Aprovar orçamento | OS → `EM_EXECUCAO`; `startedAt` registrado | Ordens de Serviço |
| Estoque consumido | Aprovar orçamento | Baixa das quantidades das peças da OS | Catálogo / Ordens de Serviço |
| Orçamento rejeitado | Rejeitar orçamento | Orçamento → `REJECTED`; OS → `CANCELADA` | Ordens de Serviço |
| Orçamento expirado | Decisão após o prazo | Orçamento → `EXPIRED`; OS → `CANCELADA` | Ordens de Serviço |
| OS finalizada | Finalizar OS | OS → `FINALIZADA`; `finishedAt` registrado; duração é término menos início | Ordens de Serviço |
| OS entregue | Registrar entrega | OS → `ENTREGUE` (estado final) | Ordens de Serviço |
| OS cancelada | Cancelar, rejeitar orçamento ou expirar orçamento | OS → `CANCELADA` (estado final) | Ordens de Serviço |
| E-mail enviado | Worker de notificações | Notificação `PENDING` → `PROCESSING` → `SENT`, ou nova tentativa/`FAILED` | Notificações |

## Políticas e regras de negócio

| Código | Política/regra | Gatilho | Aplicação descrita |
|---|---|---|---|
| RN01 | CPF/CNPJ deve ser válido (dígitos verificadores; sequências repetidas são recusadas) e único. | Cadastrar cliente; abrir OS | Value object `CustomerDocument` |
| RN02 | Placa válida no padrão `ABC1234` ou `ABC1D23`, normalizada em maiúsculas, e única. | Cadastrar/alterar veículo | Value object `VehiclePlate` |
| RN03 | Ano do veículo entre 1950 e o ano atual + 1. | Cadastrar veículo | Schema de entrada do veículo |
| RN04 | O veículo da OS deve pertencer ao cliente identificado pelo documento. | Abrir OS | Repositório de OS (transação) |
| RN05 | Somente serviços e peças ativos e não removidos podem entrar na OS. | Abrir OS | Repositório de OS (transação) |
| RN06 | Serviço ou peça não pode se repetir na mesma OS. | Abrir OS | Caso de uso Criar OS |
| RN07 | Quantidade de peça na OS deve ser inteiro maior que zero. | Abrir OS | Caso de uso Criar OS |
| RN08 | Deve haver estoque suficiente para as peças pedidas. | Abrir OS; aprovar orçamento | Repositórios de OS e de orçamento |
| RN09 | Preço unitário de serviços e peças é congelado na OS no momento da criação. | Abrir OS | Repositório de OS |
| RN10 | Total do orçamento = soma dos serviços + soma (preço da peça × quantidade), calculado em centavos. | Abrir OS | `work-order-rules` (`calculateQuoteTotal`) |
| RN11 | OS nasce com status `RECEBIDA` e orçamento `PREPARED`; criação é atômica (transação Serializable). | Abrir OS | Repositório de OS |
| RN12 | Transições de status somente nas combinações permitidas; as demais retornam 409. | Qualquer mudança de status | `work-order-rules` (`assertWorkOrderTransition`) |
| RN13 | Orçamento só pode ser enviado com OS em `EM_DIAGNOSTICO` e orçamento `PREPARED`. | Enviar orçamento | Repositório de orçamento |
| RN14 | Link de aprovação usa token aleatório guardado como hash SHA-256, é de uso único e tem validade configurável (padrão 72 h). | Enviar orçamento | Casos de uso/repositório de orçamento |
| RN15 | Orçamento só aceita decisão se estiver `PENDING` e dentro do prazo. | Aprovar/rejeitar | Repositório de orçamento |
| RN16 | Aprovação leva a OS para `EM_EXECUCAO`, registra `startedAt` e baixa o estoque, tudo na mesma transação. | Aprovar orçamento | Repositório de orçamento |
| RN17 | Rejeição ou expiração leva a OS para `CANCELADA`. | Rejeitar; decisão após prazo | Repositório de orçamento |
| RN18 | A OS só entra em `EM_EXECUCAO` pela aprovação do orçamento; transição manual é bloqueada. | Transição manual | Caso de uso Transicionar OS |
| RN19 | Finalizar a OS registra `finishedAt`. | Finalizar OS | Repositório de OS |
| RN20 | Tempo médio de execução = média de (`finishedAt` − `startedAt`), em minutos, das OS `FINALIZADA`/`ENTREGUE`. | Consultar relatório | Caso de uso do relatório |
| RN21 | Acompanhamento do cliente exige token válido (validade padrão 90 dias) e tem rate limit de 30 requisições/min. | Consultar andamento | Rotas públicas |
| RN22 | Atualizações de status falham com conflito se outro processo alterou o registro. | Qualquer mudança de status | `updateMany` condicionado ao status |
| RN23 | Saldo de estoque nunca fica negativo; baixa só ocorre se saldo ≥ quantidade. | Aprovar orçamento | Atualização condicional no repositório |
| RN24 | SKU da peça é único; preço não pode ser negativo. | Cadastrar/alterar peça | Entidade Peça; restrição no banco |
| RN25 | Exclusão é lógica (`deletedAt`) em cliente, veículo, serviço, peça e funcionário. | Inativar | Repositórios |
| RN26 | Somente `ADMIN` gerencia funcionários; as demais rotas administrativas exigem funcionário autenticado e ativo (JWT). | Qualquer rota administrativa | Plugin de autenticação / caso de uso de autorização |
| RN27 | Login limitado a 5 tentativas por minuto; senhas guardadas com bcrypt. | Login | Rota de login / use case |
| RN28 | E-mails são gravados na mesma transação do fato gerador (outbox), com conteúdo criptografado, e enviados por worker com novas tentativas. | Abrir OS; enviar orçamento | Infraestrutura compartilhada |

## Agregados

| Agregado (raiz) | Contexto | Entidades internas | Objetos de valor/invariantes | Tabelas |
|---|---|---|---|---|
| Cliente | Clientes e Veículos | — | `CustomerDocument`; documento válido e único | `customers` |
| Veículo | Clientes e Veículos | — | `VehiclePlate`; placa válida e única; pertence a um cliente | `vehicles` |
| Serviço | Catálogo | — | Preço decimal 10,2; preço não negativo | `services` |
| Peça | Catálogo | — | SKU, preço e quantidade em estoque; SKU único e saldo ≥ 0 | `parts` |
| Ordem de Serviço | Ordens de Serviço | Item de serviço da OS; item de peça da OS; Orçamento | `WorkOrderStatus`; preço unitário congelado; quantidade; token de acompanhamento (hash); transições válidas; itens sem duplicidade; execução só por aprovação; total coerente | `work_orders`, `work_order_services`, `work_order_parts`, `quotes` |
| Funcionário | Identidade e Acesso | — | `EmployeeRole`; hash de senha; e-mail único; apenas ADMIN gerencia funcionários | `employees` |
| Notificação | Notificações | — | Payload criptografado; entrega com tentativas e estados controlados | `notifications` |

O Orçamento pertence ao agregado Ordem de Serviço (mesma fronteira de consistência: status do
orçamento e da OS mudam na mesma transação), embora seja persistido em tabela própria.

## Entidades

| Entidade | Agregado | Identidade | Atributos principais |
|---|---|---|---|
| `Customer` (Cliente) | Cliente | `id` (UUID) | `name`, `document`, `email`, `phone`, `deletedAt` |
| `Vehicle` (Veículo) | Veículo | `id` (UUID) | `customerId`, `plate`, `brand`, `model`, `year`, `deletedAt` |
| `Service` (Serviço) | Serviço | `id` (UUID) | `name`, `description`, `price`, `estimatedMinutes`, `isActive`, `deletedAt` |
| `Part` (Peça/Insumo) | Peça | `id` (UUID) | `name`, `description`, `sku`, `price`, `stockQuantity`, `isActive`, `deletedAt` |
| `WorkOrder` (Ordem de Serviço) | Ordem de Serviço | `id` (UUID) | `customerId`, `vehicleId`, `status`, `startedAt`, `finishedAt`, `trackingTokenHash`, `trackingTokenExpiresAt` |
| `WorkOrderService` (Item de serviço) | Ordem de Serviço | (`workOrderId`, `serviceId`) | `unitPrice` |
| `WorkOrderPart` (Item de peça) | Ordem de Serviço | (`workOrderId`, `partId`) | `quantity`, `unitPrice` |
| `Quote` (Orçamento) | Ordem de Serviço | `id` (UUID) | `workOrderId`, `status`, `total`, `tokenHash`, `authorizationId`, `expiresAt`, `respondedAt` |
| `Employee` (Funcionário) | Funcionário | `id` (UUID) | `name`, `email`, `role`, `passwordHash`, `deletedAt` |
| `Notification` (Notificação) | Notificação | `id` (UUID) | `recipient`, `subject`, `encryptedPayload`, `status`, `attempts`, `nextAttemptAt`, `sentAt` |

## Objetos de valor

| Objeto de valor | Descrição | Regras | Usado em |
|---|---|---|---|
| `CustomerDocument` | CPF ou CNPJ, somente dígitos | 11 dígitos (CPF) ou 14 (CNPJ); dígitos verificadores; recusa sequências repetidas | Cliente; abertura de OS |
| `VehiclePlate` | Placa do veículo | Padrões `AAA9999` e `AAA9A99`; normalizada em maiúsculas sem separadores | Veículo |
| `WorkOrderStatus` | Estado da OS | `RECEBIDA`, `EM_DIAGNOSTICO`, `AGUARDANDO_APROVACAO`, `EM_EXECUCAO`, `FINALIZADA`, `ENTREGUE`, `CANCELADA` | Ordem de Serviço |
| `QuoteStatus` | Estado do orçamento | `PREPARED`, `PENDING`, `APPROVED`, `REJECTED`, `EXPIRED` | Orçamento |
| `EmployeeRole` | Perfil do funcionário | `ADMIN`, `ATTENDANT`, `MECHANIC` | Funcionário |
| Valor monetário (preço/total) | Valor em reais com 2 casas decimais | Formato numérico válido; não negativo; total calculado em centavos | Serviço; Peça; itens da OS; Orçamento |
| Quantidade em estoque | Saldo inteiro de uma peça | Inteiro ≥ 0 e dentro do limite do banco | Peça |
| Token público (acompanhamento/aprovação) | Segredo aleatório de 32 bytes enviado ao cliente | Guardado somente como hash SHA-256; tem validade; aprovação é de uso único | OS; Orçamento |

## Relação entre a documentação e a implementação

O mapeamento a seguir reproduz a relação entre os elementos documentados e os caminhos de
implementação indicados na referência.

| Elemento | Implementação indicada | Situação |
|---|---|---|
| Agregado Cliente | `customers/domain/entities/customer.ts`; infraestrutura: `prisma-customer.repository.ts` | Implementado |
| VO `CustomerDocument` (CPF/CNPJ) | `customers/domain/value-objects/customer-document.ts` | Implementado |
| Agregado Veículo | `vehicles/domain/entities/vehicle.ts` | Implementado |
| VO `VehiclePlate` | `vehicles/domain/value-objects/vehicle-plate.ts` | Implementado |
| Agregado Serviço | `services/domain/entities/service.ts` | Implementado |
| Agregado Peça + estoque | `parts/domain/entities/part.ts`; casos de uso `create`/`update`/`delete`/`add-part-stock`/`set-part-stock` | Implementado |
| Agregado Ordem de Serviço | `work-orders/domain` (`work-order-rules.ts`, `work-order-status.ts`); infraestrutura: `prisma-work-order.repository.ts` | Implementado |
| Regras de transição de status | `work-orders/domain/work-order-rules.ts` | Implementado |
| Cálculo automático do orçamento | `work-orders/domain/work-order-rules.ts` (`calculateQuoteTotal`) | Implementado |
| Orçamento (envio e decisão) | `quotes/application` (`send-quote`, `decide-quote`); `quotes/domain/quote-status.ts`; infraestrutura: `prisma-quote.repository.ts` | Implementado |
| Baixa de estoque na aprovação | `quotes/infrastructure/persistence/prisma-quote.repository.ts` (`consumeOrderParts`) | Implementado; ocorre na aprovação, que inicia a execução |
| Validação de estoque ao abrir OS | `work-orders/infrastructure/persistence/prisma-work-order.repository.ts` | Implementado |
| Acompanhamento pelo cliente | `public-tracking` (rota pública com token) | Implementado |
| Tempo médio de execução | `reports/application/get-average-execution-time`; `reports/domain/average-execution-minutes.ts` | Implementado |
| Funcionário e perfis | `employees/`; `authentication/` | Implementado |
| Autenticação JWT | `authentication/application/login`; `shared/infrastructure/auth.plugin.ts` | Implementado |
| Notificações por e-mail (outbox) | `shared/infrastructure/queue-notification.ts`; `notification-worker.ts` | Implementado |
| Incluir/remover serviço ou peça após a criação da OS | Itens são informados somente na criação (`POST /api/work-orders`) | Parcial |
| Concluir diagnóstico/gerar orçamento | Orçamento gerado automaticamente na criação; “concluir diagnóstico” ocorre ao enviar o orçamento | Parcial |
| Consultar cliente por CPF/CNPJ ou veículo por placa | Busca pelo documento ocorre na abertura da OS; consultas CRUD são por id | Parcial |