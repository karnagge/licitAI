import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed system templates for Brazilian procurement documents
  const templates = [
    {
      name: 'Edital de Pregão Eletrônico',
      description:
        'Template completo para Pregão Eletrônico conforme Lei 14.133/21',
      type: 'BIDDING_NOTICE',
      isSystem: true,
      sections: [
        {
          title: '1. PREÂMBULO',
          order: 1,
          required: true,
          guidelines:
            'Identificação do órgão licitante, número do pregão, data, horário e local (sistema eletrônico)',
        },
        {
          title: '2. OBJETO DA LICITAÇÃO',
          order: 2,
          required: true,
          guidelines:
            'Descrição detalhada do objeto, especificações técnicas, quantidades e condições de fornecimento',
        },
        {
          title: '3. CONDIÇÕES DE PARTICIPAÇÃO',
          order: 3,
          required: true,
          guidelines:
            'Requisitos para participação, documentação exigida, impedimentos legais',
        },
        {
          title: '4. CREDENCIAMENTO',
          order: 4,
          required: true,
          guidelines:
            'Procedimentos para credenciamento no sistema eletrônico',
        },
        {
          title: '5. PROPOSTA DE PREÇOS',
          order: 5,
          required: true,
          guidelines:
            'Forma de apresentação, validade, composição de preços',
        },
        {
          title: '6. ABERTURA DA SESSÃO PÚBLICA',
          order: 6,
          required: true,
          guidelines: 'Data, horário e procedimentos da sessão pública',
        },
        {
          title: '7. FORMULAÇÃO DE LANCES',
          order: 7,
          required: true,
          guidelines:
            'Regras para lance, modo de disputa, intervalo mínimo entre lances',
        },
        {
          title: '8. JULGAMENTO DAS PROPOSTAS',
          order: 8,
          required: true,
          guidelines:
            'Critérios de julgamento (menor preço), empate ficto, desempate',
        },
        {
          title: '9. HABILITAÇÃO',
          order: 9,
          required: true,
          guidelines:
            'Documentação de habilitação jurídica, fiscal, econômico-financeira e técnica',
        },
        {
          title: '10. RECURSOS ADMINISTRATIVOS',
          order: 10,
          required: true,
          guidelines:
            'Prazo e forma de apresentação de recursos conforme Lei 14.133/21',
        },
        {
          title: '11. ADJUDICAÇÃO E HOMOLOGAÇÃO',
          order: 11,
          required: true,
          guidelines: 'Procedimentos para adjudicação e homologação do certame',
        },
        {
          title: '12. GARANTIA DE EXECUÇÃO',
          order: 12,
          required: false,
          guidelines:
            'Modalidades de garantia, percentual, prazo e condições',
        },
        {
          title: '13. SANÇÕES ADMINISTRATIVAS',
          order: 13,
          required: true,
          guidelines:
            'Penalidades previstas em lei (advertência, multa, suspensão, declaração de inidoneidade)',
        },
        {
          title: '14. DOTAÇÃO ORÇAMENTÁRIA',
          order: 14,
          required: true,
          guidelines: 'Identificação da dotação orçamentária',
        },
        {
          title: '15. DISPOSIÇÕES FINAIS',
          order: 15,
          required: true,
          guidelines:
            'Informações complementares, foro competente, legislação aplicável',
        },
        {
          title: '16. ANEXOS',
          order: 16,
          required: true,
          guidelines:
            'Termo de Referência, Minuta de Contrato, Modelos de Declarações',
        },
      ],
      usageCount: 0,
    },
    {
      name: 'Aviso de Licitação',
      description:
        'Template para Aviso de Licitação (publicação obrigatória)',
      type: 'BIDDING_NOTICE',
      isSystem: true,
      sections: [
        {
          title: '1. IDENTIFICAÇÃO DO ÓRGÃO',
          order: 1,
          required: true,
          guidelines: 'Nome completo do órgão ou entidade licitante',
        },
        {
          title: '2. MODALIDADE E NÚMERO',
          order: 2,
          required: true,
          guidelines: 'Modalidade (Pregão Eletrônico) e número do processo',
        },
        {
          title: '3. OBJETO RESUMIDO',
          order: 3,
          required: true,
          guidelines: 'Descrição sucinta do objeto da licitação',
        },
        {
          title: '4. VALOR ESTIMADO',
          order: 4,
          required: true,
          guidelines: 'Valor estimado da contratação (se não sigiloso)',
        },
        {
          title: '5. DATA E HORÁRIO',
          order: 5,
          required: true,
          guidelines: 'Data e horário da abertura da sessão pública',
        },
        {
          title: '6. LOCAL',
          order: 6,
          required: true,
          guidelines:
            'Endereço eletrônico onde será realizada a licitação',
        },
        {
          title: '7. EDITAL COMPLETO',
          order: 7,
          required: true,
          guidelines:
            'Informações sobre onde obter o edital completo (site, endereço)',
        },
        {
          title: '8. INFORMAÇÕES ADICIONAIS',
          order: 8,
          required: false,
          guidelines: 'Contatos, horários de atendimento, observações',
        },
      ],
      usageCount: 0,
    },
    {
      name: 'Minuta de Contrato Administrativo',
      description:
        'Template para Contrato Administrativo conforme Lei 14.133/21',
      type: 'CONTRACT',
      isSystem: true,
      sections: [
        {
          title: '1. PREÂMBULO',
          order: 1,
          required: true,
          guidelines:
            'Identificação das partes (contratante e contratada), fundamentação legal',
        },
        {
          title: '2. OBJETO DO CONTRATO',
          order: 2,
          required: true,
          guidelines:
            'Descrição precisa do objeto contratado conforme edital',
        },
        {
          title: '3. REGIME DE EXECUÇÃO',
          order: 3,
          required: true,
          guidelines:
            'Forma de execução (empreitada, tarefa, fornecimento)',
        },
        {
          title: '4. PREÇO E CONDIÇÕES DE PAGAMENTO',
          order: 4,
          required: true,
          guidelines:
            'Valor global, forma de pagamento, reajuste, glosa',
        },
        {
          title: '5. PRAZOS',
          order: 5,
          required: true,
          guidelines:
            'Prazo de vigência, prazo de execução, prorrogação',
        },
        {
          title: '6. DOTAÇÃO ORÇAMENTÁRIA',
          order: 6,
          required: true,
          guidelines:
            'Identificação do programa, elemento de despesa, empenho',
        },
        {
          title: '7. OBRIGAÇÕES DA CONTRATANTE',
          order: 7,
          required: true,
          guidelines:
            'Responsabilidades do órgão contratante',
        },
        {
          title: '8. OBRIGAÇÕES DA CONTRATADA',
          order: 8,
          required: true,
          guidelines:
            'Responsabilidades da empresa contratada',
        },
        {
          title: '9. FISCALIZAÇÃO E GESTÃO',
          order: 9,
          required: true,
          guidelines:
            'Designação de fiscal, poderes, acompanhamento',
        },
        {
          title: '10. GARANTIA CONTRATUAL',
          order: 10,
          required: false,
          guidelines:
            'Tipo de garantia, percentual, vigência',
        },
        {
          title: '11. ALTERAÇÕES CONTRATUAIS',
          order: 11,
          required: true,
          guidelines:
            'Hipóteses e limites de alteração conforme Lei 14.133/21 Art. 124',
        },
        {
          title: '12. SANÇÕES ADMINISTRATIVAS',
          order: 12,
          required: true,
          guidelines:
            'Penalidades aplicáveis (advertência, multa, suspensão)',
        },
        {
          title: '13. RESCISÃO',
          order: 13,
          required: true,
          guidelines:
            'Hipóteses de rescisão unilateral, amigável ou judicial',
        },
        {
          title: '14. DISPOSIÇÕES FINAIS',
          order: 14,
          required: true,
          guidelines:
            'Legislação aplicável, foro competente, casos omissos',
        },
        {
          title: '15. ASSINATURAS',
          order: 15,
          required: true,
          guidelines:
            'Identificação e assinatura dos representantes legais',
        },
      ],
      usageCount: 0,
    },
    {
      name: 'Termo de Referência',
      description:
        'Template para Termo de Referência conforme Lei 14.133/21',
      type: 'TECHNICAL_SPECIFICATION',
      isSystem: true,
      sections: [
        {
          title: '1. OBJETO',
          order: 1,
          required: true,
          guidelines:
            'Definição precisa do objeto com especificações técnicas detalhadas',
        },
        {
          title: '2. JUSTIFICATIVA',
          order: 2,
          required: true,
          guidelines:
            'Fundamentação da necessidade da contratação',
        },
        {
          title: '3. DESCRIÇÃO DA SOLUÇÃO',
          order: 3,
          required: true,
          guidelines:
            'Detalhamento técnico da solução, requisitos, características',
        },
        {
          title: '4. CLASSIFICAÇÃO DOS BENS E SERVIÇOS',
          order: 4,
          required: true,
          guidelines:
            'Natureza (comum ou especial), divisibilidade, sustentabilidade',
        },
        {
          title: '5. QUANTITATIVOS E ESTIMATIVA DE PREÇOS',
          order: 5,
          required: true,
          guidelines:
            'Quantidade, unidade de medida, valor estimado, pesquisa de mercado',
        },
        {
          title: '6. MODALIDADE E CRITÉRIO DE JULGAMENTO',
          order: 6,
          required: true,
          guidelines:
            'Indicação da modalidade de licitação e critério (menor preço, etc)',
        },
        {
          title: '7. LOCAL E PRAZO DE ENTREGA',
          order: 7,
          required: true,
          guidelines:
            'Endereço de entrega, cronograma, etapas',
        },
        {
          title: '8. CONDIÇÕES DE RECEBIMENTO',
          order: 8,
          required: true,
          guidelines:
            'Procedimentos para recebimento provisório e definitivo',
        },
        {
          title: '9. GARANTIA DA CONTRATAÇÃO',
          order: 9,
          required: false,
          guidelines:
            'Se exigível, tipo e percentual de garantia',
        },
        {
          title: '10. OBRIGAÇÕES DA CONTRATANTE',
          order: 10,
          required: true,
          guidelines:
            'Responsabilidades específicas do órgão',
        },
        {
          title: '11. OBRIGAÇÕES DA CONTRATADA',
          order: 11,
          required: true,
          guidelines:
            'Responsabilidades específicas da empresa',
        },
        {
          title: '12. CRITÉRIOS DE SUSTENTABILIDADE',
          order: 12,
          required: false,
          guidelines:
            'Requisitos ambientais, sociais e econômicos',
        },
        {
          title: '13. FISCALIZAÇÃO E GESTÃO',
          order: 13,
          required: true,
          guidelines:
            'Forma de acompanhamento e fiscalização do contrato',
        },
        {
          title: '14. SANÇÕES',
          order: 14,
          required: true,
          guidelines:
            'Penalidades aplicáveis ao descumprimento',
        },
      ],
      usageCount: 0,
    },
  ];

  console.log('📝 Creating system templates...');

  for (const templateData of templates) {
    const template = await prisma.template.upsert({
      where: {
        // Use a unique combination for upsert
        name: templateData.name,
      },
      update: {},
      create: {
        ...templateData,
        tenantId: null, // System templates have no tenant
      },
    });

    console.log(`✅ Created template: ${template.name}`);
  }

  console.log('✅ Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
