const express = require('express');
const bodyParser = require('body-parser');
const ChatbotController = require('./controllers/ChatbotController')
const app = express();
const port = 3000;
app.use(express.json());
app.get('/', (req, res) => {

 
})
// Route untuk menangani POST request
app.post('/api/chatbot', ChatbotController.getResponse);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});