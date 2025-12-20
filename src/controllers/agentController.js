import { runAgent } from '../services/agentService.js';

export const callAgent = async (req, res) => {
    try {
        const { prompt } = req.body;
                
        // Run the agent
        const result = await runAgent(prompt);
        
        res.json({ response: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};