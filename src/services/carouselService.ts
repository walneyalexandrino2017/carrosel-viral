import { GoogleGenAI, Type } from "@google/genai";

const NICHE_TEMPLATES: Record<string, string> = {
  "Advogado": `
    OBJETIVO: Gerar autoridade, confiança e contato via WhatsApp.
    ESTRATÉGIA: Conteúdo educativo com alerta de risco jurídico.
    TOM DE VOZ: Formal, profissional, confiável.
    ESTRUTURA:
    Slide 1: Alerta forte sobre direitos (Hook)
    Slide 2: Situação comum do dia a dia
    Slide 3: Explicação simples da lei/doutrina
    Slide 4: Consequência negativa de não agir ou não saber
    Slide 5: CTA: Fale com um especialista agora / Tire sua dúvida no WhatsApp para uma consulta.
    VISUAL: Cores sóbrias (preto, branco, dourado/azul marinho), ambiente de escritório jurídico, biblioteca ou tribunal, estilo corporativo premium.
  `,
  "E-commerce": `
    OBJETIVO: Conversão e venda imediata.
    ESTRATÉGIA: Apresentação de produto com benefício + desejo.
    TOM DE VOZ: Direto, persuasivo, empolgante.
    ESTRUTURA:
    Slide 1: Produto chamando atenção com gancho de desejo.
    Slide 2: Benefício principal resolvendo uma dor ou trazendo prazer.
    Slide 3: Demonstração de uso ou detalhe premium do item.
    Slide 4: Prova social ou garantia de satisfação.
    Slide 5: CTA: Compre agora / Aproveite a oferta / Clique no link para garantir o seu.
    VISUAL: Fundo limpo, produto em destaque absoluto, cores vibrantes, estilo moderno e comercial.
  `,
  "Marketing Digital": `
    OBJETIVO: Gerar leads e engajamento com autoridade.
    ESTRATÉGIA: Quebra de padrão + erro comum + solução simples.
    TOM DE VOZ: Provocativo, direto, autoridade digital.
    ESTRUTURA:
    Slide 1: Quebra de crença ou afirmação forte (Hook).
    Slide 2: Erro comum que impede os resultados do seguidor.
    Slide 3: Explicação do porquê o erro acontece.
    Slide 4: Solução prática e estratégica imediata.
    Slide 5: CTA: Me chama no WhatsApp / Segue para mais dicas diárias.
    VISUAL: Estilo moderno, futurista tech ou dark clean, tons escuros ou minimalistas.
  `,
  "Fitness": `
    OBJETIVO: Engajamento e transformação física.
    ESTRATÉGIA: Correção de erro + motivação extrema.
    TOM DE VOZ: Motivacional, energético, direto e focado.
    ESTRUTURA:
    Slide 1: Alerta impactante sobre saúde ou performance.
    Slide 2: Erro comum na execução do treino ou na dieta.
    Slide 3: Sugestão técnica simplificada para resolver.
    Slide 4: Correção (O jeito certo de fazer para ter resultados).
    Slide 5: CTA: Salva isso / Compartilha com um amigo / Comece sua jornada hoje.
    VISUAL: Cenário de academia, corpo em movimento/destaque, alto contraste, iluminação dramática.
  `,
  "Estética": `
    OBJETIVO: Gerar desejo visual e agendamento de consultas/serviços.
    ESTRATÉGIA: Dor estética + solução sofisticada + transformação.
    TOM DE VOZ: Suave, aspiracional, elegante e profissional.
    ESTRUTURA:
    Slide 1: Promessa de transformação estética inspiradora.
    Slide 2: Problema comum que afetada a auto-estima do cliente.
    Slide 3: Explicação do procedimento ou tecnologia utilizada.
    Slide 4: Resultado esperado (Visualização da transformação).
    Slide 5: CTA: Agende seu horário / Fale conosco para uma avaliação.
    VISUAL: Tons claros (nude, rosa seco, branco), cenário feminino e elegante, iluminação suave e limpa.
  `,
  "Imobiliário": `
    OBJETIVO: Gerar leads qualificados para imóveis de médio/alto padrão.
    ESTRATÉGIA: Desejo de moradia + oportunidade exclusiva de mercado.
    TOM DE VOZ: Inspirador, confiável, sofisticado e visionário.
    ESTRUTURA:
    Slide 1: Imóvel dos sonhos (Hook visual de alto impacto).
    Slide 2: Benefício de localização, segurança ou estilo de vida.
    Slide 3: Diferencial arquitetônico, acabamento ou área de lazer.
    Slide 4: Oportunidade única e condições de aquisição.
    Slide 5: CTA: Agende uma visita / Fale com o corretor agora.
    VISUAL: Casas modernas, iluminação natural, luxo, estilo sofisticado, amplo espaço.
  `,
  "Restaurante": `
    OBJETIVO: Atrair clientes para o local físico ou aumentar vendas delivery.
    ESTRATÉGIA: Apetite appeal + desejo sensorial imediato.
    TOM DE VOZ: Convidativo, sensorial, próximo e informal.
    ESTRUTURA:
    Slide 1: Prato exclusivo com close extremo (Hook de dar água na boca).
    Slide 2: Descrição dos ingredientes frescos ou preparo artesanal.
    Slide 3: Diferencial de sabor, tempero ou experiência gastronômica.
    Slide 4: Clima do ambiente ou praticidade do serviço de entrega.
    Slide 5: CTA: Venha hoje / Peça agora pelo link no WhatsApp.
    VISUAL: Comida em foto "macro", iluminação quente e acolhedora, cores estimulantes.
  `,
  "Educação": `
    OBJETIVO: Gerar leads para cursos, mentorias ou infoprodutos.
    ESTRATÉGIA: Transformação pelo conhecimento + oportunidade de evolução.
    TOM DE VOZ: Educativo, inspirador, didático e encorajador.
    ESTRUTURA:
    Slide 1: Promessa de novo aprendizado ou domínio de habilidade.
    Slide 2: Problema da estagnação ou falta de método claro.
    Slide 3: Explicação do método ou conteúdo chave ensinado.
    Slide 4: A solução definitiva e o caminho para o sucesso.
    Slide 5: CTA: Inscreva-se / Comece hoje mesmo / Link na Bio.
    VISUAL: Ambiente de estudo organizado, professor/mentor focado, estilo clean e didático.
  `,
  "Geral": `
    OBJETIVO: Engajamento e informação de qualidade.
    ESTRATÉGIA: Abordagem informativa equilibrada para o assunto.
    TOM DE VOZ: Adaptado organicamente ao contexto do usuário.
    ESTRUTURA: Introdução impactante, Problematização, Conteúdo central, Dica prática e Chamada de ação.
    VISUAL: Design limpo com foco em legibilidade.
  `
};

function criarPrompt(texto: string, estilo: string, nicho: string, objetivo: string) {
  const template = NICHE_TEMPLATES[nicho] || NICHE_TEMPLATES["Geral"];
  return `
    Você é um Diretor de Criação e Especialista em Design com mais de 10 anos de experiência em agências de elite.
    Sua missão é sintetizar um carrossel de 5 slides com base na ESTRATÉGIA DE NICHO, no OBJETIVO e no ASSUNTO abaixo.

    --- ESTRATÉGIA DE NICHO (OBRIGATÓRIO SEGUIR) ---
    NICHO: "${nicho}"
    ${template}

    --- OBJETIVO DA CAMPANHA ---
    O carrossel deve ser otimizado para: "${objetivo}" (Adapte ganchos e CTAs para este foco).

    --- DADOS DO USUÁRIO ---
    ASSUNTO BASE: "${texto}"
    ESTILO VISUAL: "${estilo}"

    Agora siga TODAS as regras abaixo para criar um carrossel profissional:
    - Criar EXATAMENTE 5 slides.
    - Texto extremamente curto e impactante (máx 8 palavras por bloco).
    - FOCO TOTAL: Título atraente, Sub-título complementar e Descrição concisa.
    - Consistência visual absoluta entre os slides.
    - Design profissional de agência premiada.
    - O prompt_imagem deve descrever uma cena visual pura (SEM TEXTO) que represente o conceito do slide.

    ESTRUTURA:
    Slide 1: Hook (impacto visual e textual)
    Slide 2: Problema/Dor
    Slide 3: Agitação/Processo
    Slide 4: Solução/Desejo
    Slide 5: CTA (Call to Action estratégico)

    FORMATO DE RESPOSTA (JSON):
    {
      "titulo_geral": "string",
      "slides": [
        {
          "titulo": "string",
          "subtitulo": "string",
          "descricao": "string",
          "prompt_imagem": "descrição visual purista SEM TEXTO incluindo estilo ${estilo} e estética de agência de marketing digital high-end"
        }
      ],
      "legenda": "texto da legenda completa para post",
      "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
    }
  `;
}

interface Slide {
  titulo: string;
  subtitulo: string;
  descricao: string;
  prompt_imagem: string;
  imageUrl?: string;
}

interface CarouselResponse {
  titulo_geral: string;
  slides: Slide[];
  legenda: string;
  hashtags: string[];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callWithRetry(fn: () => Promise<any>, retries = 3, delay = 2000) {
  try {
    return await fn();
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    const isQuotaError =
      errorMsg.includes("429") || errorMsg.includes("quota") || err?.status === 429;
    if (isQuotaError && retries > 0) {
      console.log(`Quota limit hit, retrying in ${delay / 1000}s... (${retries} left)`);
      await sleep(delay);
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

export async function gerarCarrossel(
  texto: string, 
  estilo: string, 
  nicho: string, 
  objetivo: string, 
  aspect: string
): Promise<CarouselResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please set it in the settings.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const promptText = criarPrompt(texto, estilo, nicho, objetivo);

  const textModelName = "gemini-3-flash-preview";
  const textResponse = await callWithRetry(() =>
    ai.models.generateContent({
      model: textModelName,
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titulo_geral: { type: Type.STRING },
            legenda: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  titulo: { type: Type.STRING },
                  subtitulo: { type: Type.STRING },
                  descricao: { type: Type.STRING },
                  prompt_imagem: { type: Type.STRING },
                },
                required: ["titulo", "subtitulo", "descricao", "prompt_imagem"],
              },
            },
          },
          required: ["titulo_geral", "slides", "legenda", "hashtags"],
        },
      },
    })
  );

  if (!textResponse.text) {
    throw new Error("A IA não retornou um texto válido.");
  }

  const carouselData: CarouselResponse = JSON.parse(textResponse.text);

  // Image generation
  const imageModelName = "gemini-2.5-flash-image";
  const slidesWithImages = [...carouselData.slides];

  for (let i = 0; i < slidesWithImages.length; i++) {
    const slide = slidesWithImages[i];

    if (i > 0) await sleep(1000);

    const fullImagePrompt = `High-end Digital Marketing Agency Aesthetic. Professional Photography. Visual Aesthetic: ${estilo}. ${slide.prompt_imagem}. 
    Requirements: NO TEXT, NO TYPOGRAPHY, 8k resolution, cinematic lighting, professional composition, high contrast, minimalist clean backgrounds.`;

    const imgResponse = await callWithRetry(() =>
      ai.models.generateContent({
        model: imageModelName,
        contents: [{ role: "user", parts: [{ text: fullImagePrompt }] }],
        config: {
          imageConfig: {
            aspectRatio:
              aspect === "9:16" ? "9:16" : aspect === "16:9" ? "16:9" : "3:4",
          },
        },
      })
    );

    if (imgResponse.candidates?.[0]?.content?.parts) {
      for (const part of imgResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          slidesWithImages[i].imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }
  }

  carouselData.slides = slidesWithImages;
  return carouselData;
}
