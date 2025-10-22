
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineTitle,
  TimelineDescription,
  TimelineContent,
} from "@/components/ui/timeline";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Megaphone, GitCommit, Settings, FileSignature, Palette, PlusCircle, Wrench, Bug, FileText, Package, Users, LayoutPanelLeft } from "lucide-react";

type UpdatesPageProps = {
  notice: string;
};

// Histórico estático de atualizações
const updateHistory = [
   {
    version: "v1.10",
    date: "26/07/2024",
    title: "Refatoração do Menu de Navegação",
    description: "Para uma interface mais limpa, o botão 'Retiradas' foi movido da tela inicial para dentro do menu principal, deixando apenas o botão 'Início' em destaque.",
    icon: LayoutPanelLeft,
  },
  {
    version: "v1.9",
    date: "25/07/2024",
    title: "Mural de Avisos e Histórico de Atualizações",
    description: "Adicionada a nova aba 'Atualizações' com um mural de avisos dinâmico (controlado via Firebase) e o histórico das últimas 10 alterações.",
    icon: Megaphone,
  },
  {
    version: "v1.8",
    date: "24/07/2024",
    title: "Ajustes e Melhorias nos Contratos",
    description: "Corrigidos múltiplos bugs na geração de contratos, incluindo o problema com 'Tipo de Pessoa' e a estrutura do PDF. O modelo de contrato foi atualizado e a cidade foi fixada para 'Cacoal - RO'.",
    icon: FileSignature,
  },
  {
    version: "v1.7",
    date: "23/07/2024",
    title: "Instalador de Aplicativo (PWA)",
    description: "Implementada a funcionalidade de Progressive Web App (PWA), permitindo que o sistema seja instalado em celulares e computadores para uma experiência mais nativa.",
    icon: PlusCircle,
  },
  {
    version: "v1.6",
    date: "22/07/2024",
    title: "Aba de Configurações",
    description: "Introduzida a aba 'Configurações', com opções para trocar o tema (claro/escuro), restaurar o banner e uma 'Zona de Perigo' para resetar todos os dados do aplicativo com segurança.",
    icon: Settings,
  },
  {
    version: "v1.5",
    date: "21/07/2024",
    title: "Banner da Tela de Retiradas Editável",
    description: "Agora é possível trocar a imagem do banner da tela de retiradas. A imagem é salva no Firebase e sincronizada entre todos os dispositivos.",
    icon: Palette,
  },
  {
    version: "v1.4",
    date: "20/07/2024",
    title: "Melhorias no Layout e Grupos de Produtos",
    description: "Os produtos na tela de retirada foram agrupados por tipo (Verde e Amarelo, Roxo e alaranjado, Outros) para facilitar a navegação. O layout da página de caixa foi otimizado para telas maiores.",
    icon: Wrench,
  },
  {
    version: "v1.3",
    date: "19/07/2024",
    title: "Correção de Exclusão de Itens e Clientes",
    description: "Corrigido um bug que permitia a exclusão de itens e clientes sem a confirmação de PIN, adicionando a camada de segurança necessária para essas ações críticas.",
    icon: Bug,
  },
  {
    version: "v1.2",
    date: "18/07/2024",
    title: "Implementação da Aba de Contratos",
    description: "Adicionada a funcionalidade completa de geração de contratos, permitindo preencher os dados do contratante, objeto, valores e testemunhas para gerar um documento para impressão.",
    icon: FileSignature,
  },
  {
    version: "v1.1",
    date: "17/07/2024",
    title: "Fechamento de Caixa e Relatórios",
    description: "Implementadas as abas 'Fechamento' e 'Relatórios', permitindo a conferência de valores, registro de despesas e o salvamento de um resumo diário, com acesso protegido por PIN.",
    icon: FileText,
  },
];


export function UpdatesPage({ notice }: UpdatesPageProps) {
  const defaultNotice = `Prezados usuários,

Informamos que uma nova atualização está programada para o dia 25 de outubro de 2025. Nesta data, implementaremos melhorias e novas funcionalidades no menu de Contratos.

---

A/C Sandra:

Solicitamos, por gentileza, a realização de testes abrangentes no aplicativo. O escopo dos testes deve incluir:

- Criação de clientes (Pessoa Física e Jurídica).
- Realização de vendas com diferentes formas de pagamento.
- Fechamento de caixa, registrando despesas e entradas.
- Exclusão de relatórios de fechamento.
- Testes de todas as demais funcionalidades disponíveis.

Ao final, pedimos a elaboração de uma descrição detalhada de todas as funções do aplicativo para documentação.

Agradecemos a colaboração.


**Informações de Acesso:**
Senha para acesso aos relatórios e exclusão: **2209**
Senha para acesso inicial ao aplicativo: **8352**`;

  const finalNotice = notice || defaultNotice;

  return (
    <div className="space-y-8">
      {/* Mural de Avisos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Mural de Avisos
          </CardTitle>
          <CardDescription>
            Fique por dentro das últimas notícias e comunicados importantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {finalNotice ? (
            <Alert>
              <AlertTitle>Comunicado Importante</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap">
                {finalNotice}
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Nenhum aviso no momento.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Atualizações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atualizações</CardTitle>
          <CardDescription>
            Veja o que há de novo nas últimas versões do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Timeline>
            {updateHistory.map((update, index) => (
              <TimelineItem key={index}>
                <TimelineConnector />
                <TimelineHeader>
                  <TimelineIcon>
                    <update.icon className="h-4 w-4" />
                  </TimelineIcon>
                  <TimelineTitle>{update.title}</TimelineTitle>
                  <p className="text-sm text-muted-foreground ml-auto">{update.date}</p>
                </TimelineHeader>
                <TimelineContent>
                  <TimelineDescription>{update.description}</TimelineDescription>
                </TimelineContent>
              </TimelineItem>
            ))}
             <TimelineItem>
                <TimelineHeader>
                  <TimelineIcon>
                    <GitCommit className="h-4 w-4" />
                  </TimelineIcon>
                  <TimelineTitle>Início do Projeto</TimelineTitle>
                </TimelineHeader>
              </TimelineItem>
          </Timeline>
        </CardContent>
      </Card>
    </div>
  );
}
