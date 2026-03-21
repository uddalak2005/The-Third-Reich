import 'dotenv/config'
import axios from 'axios'

const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say hello' }]
    },
    {
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        }
    }
)

console.log(response.data.choices[0].message.content)