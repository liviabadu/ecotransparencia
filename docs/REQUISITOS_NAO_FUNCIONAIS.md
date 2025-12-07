# Requisitos Não-Funcionais - EcoTransparência

## Introdução

Este documento especifica os requisitos não-funcionais (também chamados de requisitos de qualidade) do sistema EcoTransparência. Estes requisitos definem como o sistema deve se comportar em termos de desempenho, segurança, usabilidade e outras características de qualidade, seguindo as diretrizes da norma ISO/IEC 25010.

Os requisitos não-funcionais são fundamentais para garantir que o sistema não apenas execute suas funções corretamente, mas que o faça de maneira eficiente, segura e agradável para o usuário.

---

## Desempenho

Os requisitos de desempenho definem os limites de tempo de resposta e capacidade de processamento que o sistema deve atender.

### RQ01 - Tempo de Resposta para Consultas

O sistema deve garantir que consultas realizadas por nome ou CPF/CNPJ retornem resultados ao usuário em no máximo 5 segundos, considerando a agregação de dados de todas as fontes integradas.

**Justificativa:** Tempos de resposta superiores a 5 segundos comprometem a experiência do usuário e podem levar ao abandono da plataforma. Este limite considera o tempo necessário para consultar múltiplas APIs externas e consolidar os resultados.

**Métrica de Verificação:** 95% das consultas devem ser concluídas em até 5 segundos em condições normais de operação.

### RQ02 - Tempo de Geração de Relatórios

O sistema deve gerar relatórios comparativos entre múltiplas entidades (até 5 entidades simultâneas) em no máximo 5 segundos.

**Justificativa:** A funcionalidade de comparação é crítica para tomada de decisão. Tempos prolongados reduzem a produtividade do usuário e a utilidade da ferramenta.

### RQ03 - Suporte a Usuários Simultâneos

O sistema deve suportar no mínimo 1.000 usuários simultâneos sem degradação perceptível de desempenho.

**Justificativa:** Para atender instituições financeiras e empresas de grande porte, o sistema precisa escalar adequadamente durante picos de uso, como períodos de due diligence ou auditorias.

---

## Disponibilidade

Os requisitos de disponibilidade garantem que o sistema esteja operacional quando os usuários precisarem acessá-lo.

### RQ04 - Disponibilidade Mínima

O sistema deve apresentar disponibilidade mínima de 99,5% do tempo, o que equivale a no máximo 3,65 horas de indisponibilidade por mês.

**Justificativa:** A alta disponibilidade é essencial para um sistema utilizado em decisões de negócio críticas. Indisponibilidades frequentes ou prolongadas comprometem a confiança dos usuários.

### RQ05 - Recuperação de Falhas

Em caso de falha de comunicação com uma das fontes de dados externas, o sistema deve continuar operando normalmente, informando ao usuário quais fontes não puderam ser consultadas sem interromper o processamento das demais.

**Justificativa:** A dependência de APIs governamentais externas introduz pontos de falha que estão fora do controle da plataforma. O sistema deve ser resiliente a essas situações.

---

## Usabilidade

Os requisitos de usabilidade garantem que o sistema seja fácil de usar e compreender por diferentes perfis de usuários.

### RQ06 - Curva de Aprendizado

O sistema deve ser intuitivo o suficiente para que usuários leigos (sem conhecimento técnico prévio) consigam realizar consultas e interpretar resultados sem necessidade de treinamento formal.

**Justificativa:** A democratização do acesso a informações socioambientais é um dos pilares da EcoTransparência. Uma interface complexa criaria barreiras que contradizem essa missão.

**Métrica de Verificação:** Em testes de usabilidade, 80% dos novos usuários devem conseguir completar uma consulta e interpretar o resultado em até 3 minutos na primeira utilização.

### RQ07 - Interface Responsiva

O sistema deve oferecer uma interface otimizada para acesso em dispositivos desktop, garantindo boa experiência visual e funcional em diferentes resoluções de tela.

**Justificativa:** O público-alvo primário (analistas financeiros, gestores, auditores) utiliza predominantemente computadores desktop em seu trabalho. A interface deve ser otimizada para este contexto.

### RQ08 - Feedback Visual

O sistema deve fornecer feedback visual claro durante operações demoradas (como consultas a múltiplas bases), indicando o progresso e o status de cada etapa do processamento.

**Justificativa:** A ausência de feedback durante operações pode levar o usuário a acreditar que o sistema travou, resultando em tentativas de reenvio ou abandono da consulta.

---

## Segurança

Os requisitos de segurança protegem os dados e o acesso ao sistema contra ameaças e usos não autorizados.

### RQ09 - Criptografia em Trânsito

Toda comunicação entre o cliente (navegador) e o servidor deve utilizar protocolo TLS (Transport Layer Security) versão 1.2 ou superior, garantindo que os dados não possam ser interceptados durante a transmissão.

**Justificativa:** Mesmo que os dados consultados sejam públicos, as consultas realizadas pelos usuários podem revelar informações estratégicas sobre seus interesses e operações.

### RQ10 - Criptografia em Repouso

Dados sensíveis armazenados no sistema (como credenciais de usuários e logs de consulta) devem ser criptografados utilizando algoritmo AES-256.

**Justificativa:** Em caso de comprometimento do banco de dados, a criptografia em repouso garante que os dados permaneçam ilegíveis para atacantes.

### RQ11 - Autenticação Robusta

O sistema deve implementar autenticação multifator (MFA) para acesso de usuários, exigindo confirmação através de dois métodos distintos (por exemplo, senha e código enviado por SMS ou aplicativo autenticador).

**Justificativa:** A autenticação de fator único (apenas senha) é vulnerável a ataques de força bruta, phishing e vazamento de credenciais. O MFA adiciona uma camada significativa de proteção.

### RQ12 - Autorização Baseada em Papéis

O sistema deve implementar controle de acesso baseado em papéis (RBAC - Role Based Access Control), garantindo que cada perfil de usuário (Gerente, Funcionário, Cliente) tenha acesso apenas às funcionalidades e dados autorizados para seu papel.

**Justificativa:** O princípio do menor privilégio reduz a superfície de ataque e minimiza os danos potenciais em caso de comprometimento de credenciais de um usuário específico.

### RQ13 - Validação Dupla de Acesso

O acesso ao sistema somente será autorizado após validação bem-sucedida de usuário e senha, seguida de confirmação através do segundo fator de autenticação.

**Justificativa:** Este requisito reforça o RQ11, explicitando que ambos os fatores são obrigatórios, não opcionais.

---

## Manutenibilidade

Os requisitos de manutenibilidade garantem que o sistema possa ser atualizado, corrigido e expandido de forma eficiente ao longo de sua vida útil.

### RQ14 - Arquitetura Modular

O sistema deve ser construído com arquitetura modular, permitindo que novos módulos de integração com fontes de dados sejam adicionados sem necessidade de alterações significativas na estrutura existente.

**Justificativa:** Novas fontes de dados governamentais podem se tornar disponíveis, ou fontes existentes podem mudar seus formatos. A arquitetura modular facilita a adaptação a essas mudanças.

### RQ15 - Documentação de Código e APIs

Todo o código fonte e APIs devem ser adequadamente documentados, incluindo comentários explicativos em funções complexas, documentação de endpoints de API (utilizando padrões como OpenAPI/Swagger), e manuais técnicos para desenvolvedores.

**Justificativa:** A documentação adequada reduz o tempo necessário para novos desenvolvedores compreenderem o sistema e diminui o risco de introdução de bugs durante manutenções.

---

## Conformidade

Os requisitos de conformidade garantem que o sistema atenda às regulamentações legais aplicáveis.

### RQ16 - Conformidade com LGPD

O sistema deve estar em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), implementando os mecanismos necessários para proteção de dados pessoais, incluindo registro de consentimento quando aplicável, possibilidade de exclusão de dados pessoais mediante solicitação, e logs de acesso a dados pessoais.

**Justificativa:** O não cumprimento da LGPD pode resultar em sanções administrativas significativas e danos à reputação da organização.

### RQ17 - Identificação de Fonte

Todo dado apresentado ao usuário deve ser claramente identificado quanto à sua fonte de origem, incluindo o nome do órgão ou entidade responsável pela publicação original.

**Justificativa:** A transparência sobre a origem dos dados é fundamental para a credibilidade da plataforma e permite que usuários verifiquem as informações nas fontes oficiais quando necessário.

---

## Interoperabilidade

Os requisitos de interoperabilidade garantem que o sistema possa trocar informações com outros sistemas de forma eficiente.

### RQ18 - Exportação de Dados

O sistema deve permitir exportação de dados nos formatos PDF (para relatórios formais), Excel/CSV (para análise em ferramentas externas) e JSON (para integração programática).

**Justificativa:** Diferentes usuários têm diferentes necessidades de consumo dos dados. A variedade de formatos atende a cenários que vão desde apresentações executivas até análises automatizadas.

---

## Matriz de Verificação

A tabela a seguir resume os requisitos não-funcionais e seus métodos de verificação.

| Código | Categoria | Resumo | Método de Verificação |
|--------|-----------|--------|----------------------|
| RQ01 | Desempenho | Consultas em até 5 segundos | Teste de performance automatizado |
| RQ02 | Desempenho | Relatórios comparativos em até 5 segundos | Teste de performance automatizado |
| RQ03 | Desempenho | 1.000 usuários simultâneos | Teste de carga |
| RQ04 | Disponibilidade | 99,5% de uptime | Monitoramento contínuo |
| RQ05 | Disponibilidade | Resiliência a falhas de APIs externas | Teste de falha injetada |
| RQ06 | Usabilidade | Uso sem treinamento | Teste de usabilidade com usuários |
| RQ07 | Usabilidade | Interface responsiva para desktop | Teste em múltiplas resoluções |
| RQ08 | Usabilidade | Feedback visual em operações | Inspeção de interface |
| RQ09 | Segurança | TLS 1.2+ | Análise de tráfego de rede |
| RQ10 | Segurança | AES-256 em repouso | Auditoria de segurança |
| RQ11 | Segurança | MFA | Teste funcional |
| RQ12 | Segurança | RBAC | Teste de autorização |
| RQ13 | Segurança | Validação dupla | Teste funcional |
| RQ14 | Manutenibilidade | Arquitetura modular | Revisão de arquitetura |
| RQ15 | Manutenibilidade | Documentação | Revisão de documentação |
| RQ16 | Conformidade | LGPD | Auditoria de conformidade |
| RQ17 | Conformidade | Identificação de fonte | Inspeção de interface |
| RQ18 | Interoperabilidade | Múltiplos formatos de exportação | Teste funcional |
