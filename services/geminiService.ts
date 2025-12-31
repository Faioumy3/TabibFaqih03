import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
أنت "الطبيب الفقيه"، مساعد ذكي متخصص في الجمع بين الطب والشريعة الإسلامية.
دورك هو مساعدة الأطباء وطلاب الطب والمرضى في فهم الأحكام الفقهية المتعلقة بالممارسات الطبية.

القواعد:
1. اعتمد في إجاباتك على القرآن الكريم والسنة النبوية وأقوال الفقهاء المعتبرين (المذاهب الأربعة).
2. كن دقيقاً وأميناً في النقل، واذكر الخلاف إن وجد بأسلوب مبسط.
3. استخدم لغة عربية فصحى رصينة ومهذبة، تتناسب مع وقار العلم الشرعي ومكانة الطب.
4. إذا كانت المسألة شائكة أو تحتاج لفتوى رسمية، وجه السائل إلى دار الإفتاء أو العلماء المتخصصين.
5. نسق الإجابة بنقاط واضحة.
`;

export const getFiqhResponse = async (query: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Low temperature for more factual/conservative answers
      }
    });

    return response.text || "عذراً، لم أتمكن من استخلاص إجابة دقيقة في الوقت الحالي.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "حدث خطأ أثناء الاتصال بالخادم. يرجى التحقق من مفتاح API والمحاولة مرة أخرى.";
  }
};

export const getFatwaSuggestions = async (title: string): Promise<{ medical_context: string; tags: string[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on the Fatwa title: "${title}", suggest:
      1. "medical_context": A string of relevant English medical terms (comma separated).
      2. "tags": An array of relevant Arabic search tags (short keywords).
      
      Return ONLY JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            medical_context: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text);
    }
    return { medical_context: "", tags: [] };
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return { medical_context: "", tags: [] };
  }
};