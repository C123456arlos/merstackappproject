import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/User.js"
import openai from "../configs/openai.js"
import imagekit from '../configs/imagekit.js'
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id
        if (req.user.credits < 1) {
            return res.json({success:false, message:'you dont have enough credits to use this feature'})
        }
        const { chatId, prompt } = req.body
        const chat = await Chat.findOne({ userId, _id: chatId })
        chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false })
   
        const {choices} = await openai.chat.completions.create({
    model: "meta-llama/Llama-3.1-8B-Instruct:novita",
            // model: "gemini-3.8-flash",
            messages: [
        {
            role: "user",
            content: prompt,
        },
            ],
     max_tokens: 150
        });
        const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false }
        res.json({success:true, reply})
        chat.messages.push(reply)
        await chat.save()
        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } })
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id
        if (req.user.credits < 2) {
            return res.json({success:false, message:'you dont have enough credits to use this feature'})
        }
        const { prompt, chatId, isPublished } = req.body
        const chat = await Chat.findOne({ userId, _id: chatId })
        chat.messages.push({role:'user', content:prompt, timestamp:Date.now(), isImage:false})
        const encodedPrompt = encodeURIComponent(prompt)
        const generatedImageUrl =
       ' https://ik.imagekit.io/ikmedia/footwear.jpg?tr=bg-genfill-prompt-flowers,w-1000,h-960,cm-pad_resize'
        // 'https://ik.imagekit.io/ezvotm7lb/ik-genimg-prompt-A man climbing stairs/gen-man-climbing-stairs-image.png'
            // `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-A man eating a burger/app/${Date.now()}.png?tr`
            // `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/app/${Date.now()}.png?tr=w-800,h-800`
        const aiImageResponse = await axios.get(generatedImageUrl, { responseType: 'arraybuffer' })
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, 'binary').toString('base64')}`
        // const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, 'binary').toString('base64')}`
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder:'app'
        })
        const reply = {
            role: 'assistant',content:uploadResponse.url,
            timestamp: Date.now(), isImage: true, isPublished
        }
        res.json({ success: true, reply })
        chat.messages.push(reply)
        await chat.save()
        await User.updateOne({_id:userId},{$inc:{credits:-2}})
    } catch (error) {
        res.json({success:false, message:error.message})
    }
}