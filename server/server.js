import express from "express";
import axios from "axios";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

const papagoTranslate = async (text, source, target) => {
  const url = "https://openapi.naver.com/v1/papago/n2mt";

  // 헤더 설정
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
    "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET,
  };

  // 한영 설정
  const data = `source=${source}&target=${target}&text=${text}`;

  try {
    const response = await axios.post(url, data, { headers });
    return response.data.message.result.translatedText;
  } catch (error) {
    console.log(error);
  }
};

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "API 테스트입니다!" + `${process.env.OPENAI_API_KEY}`,
  });
});

app.post("/", async (req, res) => {
  try {
    const prompt = await papagoTranslate(req.body.prompt, "ko", "en");

    const response = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
    });

    const botResponse = await papagoTranslate(
      response.data.choices[0].text,
      "en",
      "ko"
    );

    res.status(200).send({
      bot: botResponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error || "서버 에러입니다");
  }
});

app.listen(5000, () =>
  console.log("AI server started on http://localhost:5000")
);
