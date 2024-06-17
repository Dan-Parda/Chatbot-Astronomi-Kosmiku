const tfnode = require('@tensorflow/tfjs-node');
const tf = require("@tensorflow/tfjs");
const path = require('path');
const fs = require('fs');
let model ;
let tokenizer;
let label;
let data
const modelpath = path.join(__dirname, '../model', 'model.json');
const handler = tfnode.io.fileSystem(modelpath);
const loadModel = async () => {
    try { 
        model = await tf.loadLayersModel(handler)   
    } catch (error) {
        console.error('Error loading model:', error);
    }
};
const loadData = async () => {
    try {
        const dataPath = path.join(__dirname, '../model', 'data-chatbot.json');
        const datadata = fs.readFileSync(dataPath, 'utf-8');
        const datadataparse = JSON.parse(datadata);
        data = datadataparse['intents']; 

    } catch (error) {
        console.log(error)
    }
}
function getRandomInRange(max) {
    return Math.floor(Math.random() * (max - 0 + 1)) + 0;
  }
function getOuput(input){
    for (let i = 0; i < data.length; i++) {
        if (data[i]['tag'].toLowerCase() == input) {
            let responsearr = getRandomInRange(data[i]['responses'].length - 1)
            return data[i]['responses'][responsearr]
        }
        
    }
}
loadModel();
const loadTokenizer = async () => {
    try {
        const tokenizerPath = path.join(__dirname, '../model', 'tokenizer.json');
        const tokenizerData = fs.readFileSync(tokenizerPath, 'utf-8');
        tokenizer = JSON.parse(tokenizerData);
        tokenizer = JSON.parse(tokenizer.config.word_index);
    } catch (error) {
        console.error('Error loading tokenizer:', error);
    }
};

loadTokenizer();
const textToSequences = (text, tokenizer) => {
    return text.split(' ').map(word => tokenizer[word] || 0);
};
const processText = (input) => {
    const punctuation = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~';
    const processedInput = input
        .split('')
        .filter(letter => !punctuation.includes(letter))
        .map(letter => letter.toLowerCase())
        .join('');
    return processedInput;
};
const padSequences = (sequences, maxlen) => {
    return sequences.map(seq => {
        if (seq.length < maxlen) {
            return [...seq, ...Array(maxlen - seq.length).fill(0)];
        } else {
            return seq.slice(0, maxlen);
        }
    });
};
const loadLabel = async() => {
    try {
        const labelpath = path.join(__dirname, '../model', 'label_encoder.json');
        const labelData = fs.readFileSync(labelpath, 'utf-8');
        label = JSON.parse(labelData); 
        label = label['classes_'] 
    } catch (error) {
        console.log(error)
    }
}
loadData()
loadLabel()
const apikey = 'j6^1En-%|X[O(voHro6N>}!-=8Ie1P,k'
exports.getResponse = (req, res) => {
    
    console.log(req.body)
    if (req.body.apikey !== apikey) {
        return res.status(403).json({
            message: 'Method not Allow, Api key is not correct'
        });
    }
    try {
            
    
        let texts_p = [];
        const input = req.body.question;
        let predictionInput = processText(input);
        texts_p.push(predictionInput); 

        const sequences = textToSequences(predictionInput, tokenizer); 
        let predictionInputTensor = tf.tensor(sequences).reshape([-1]); 

        const paddedSequences = padSequences([predictionInputTensor.arraySync()], 10); 
        const inputTensor = tf.tensor(paddedSequences); 

        const predictions = model.predict(inputTensor);  
        
        const output = predictions.argMax(-1).dataSync()[0];
        const tag = label[output];
        const respon = getOuput(tag);
         
        res.status(200).json({
            answer: respon,
        });
    } catch (error) {
        res.send(error);
    }
   
  
}