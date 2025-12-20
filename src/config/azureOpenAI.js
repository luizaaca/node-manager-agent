import { AzureChatOpenAI } from '@langchain/openai';

// Configure Azure OpenAI model
const model = new AzureChatOpenAI({
    azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_ENDPOINT.split('/')[2].split('.')[0],  // Extract instance name
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
    temperature: 0,  // Low temperature for consistent query generation
});

export default model;