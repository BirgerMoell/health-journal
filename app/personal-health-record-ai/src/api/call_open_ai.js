import OpenAI from 'openai';



const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY || 'api_key', dangerouslyAllowBrowser: true
});

const streamOpenAI = async (prompt, systemPrompt = 'You are an expert medical doctor providing health advice and analysis.', onChunk) => {
  try {
    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      stream: true,
      temperature: 0.0,
      max_tokens: 1000,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
      if (onChunk) {
        onChunk(content, fullResponse);
      }
    }

    return fullResponse;
  } catch (error) {
    console.error('Error streaming from OpenAI API:', error);
    throw error;
  }
};



const callOpenAI = async (prompt, systemPrompt = 'You are an expert medical doctor providing health advice and analysis.') => {
  try {
    const chatCompletion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.0,
      max_tokens: 1000,
    });

    return chatCompletion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};

export { callOpenAI, streamOpenAI };

// Example usage of the callOpenAI function
// const testCallOpenAI = async () => {
//   try {
//     const testPrompt = "What are some general tips for maintaining good health?";
//     const result = await callOpenAI(testPrompt);
//     console.log("OpenAI API Response:", result);
//   } catch (error) {
//     console.error("Error in test call to OpenAI:", error);
//   }
// };

// // Run the test
// testCallOpenAI();
