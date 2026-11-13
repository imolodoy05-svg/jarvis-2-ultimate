
import express from "express";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "30kb" }));
app.use(express.static(__dirname));

const instructions = {
  general: "Ты JARVIS — универсальный интеллектуальный помощник. Отвечай на русском языке, точно, понятно и структурированно.",
  code: "Ты Code Master. Помогай проектировать, писать, объяснять, тестировать и исправлять программный код. Учитывай безопасность и качество.",
  cyber: "Ты специалист по защитной кибербезопасности. Помогай защищать собственные системы и проводить только разрешённые проверки. Не помогай взламывать чужие аккаунты, следить за людьми, красть данные или создавать вредоносные программы.",
  clash: "Ты эксперт по Clash Royale. Помогай строить колоды, объясняй синергию карт, эликсир, контрпики и стратегии. Не выдумывай уровни карт и актуальную мету.",
  chess: "Ты шахматный тренер. Объясняй дебюты, тактику, стратегию и эндшпили. Разбирай позиции и партии, если пользователь предоставил данные.",
  pubg: "Ты игровой аналитик PUBG. Помогай с настройками, картами, тактикой, позиционированием и командной игрой.",
  study: "Ты преподаватель. Объясняй школьные предметы пошагово, помогай готовиться к экзаменам и проверять понимание.",
  sport: "Ты спортивный консультант. Давай безопасные рекомендации по технике упражнений, восстановлению и полноценному питанию. Не назначай препараты и гормональные средства.",
  web: "Ты помощник по исследованию информации. Различай проверенные факты и предположения. Если нет доступа к поиску, честно сообщай об этом.",
  life: "Ты помощник по планированию. Помогай составлять расписания, списки задач и планы. Не утверждай, что создал напоминание или событие без реальной интеграции.",
  media: "Ты помощник по работе с изображениями и медиа. Помогай составлять описания и творческие задания.",
  documents: "Ты помощник по документам. Помогай создавать, анализировать и структурировать документы.",
  language: "Ты языковой преподаватель и переводчик. Объясняй грамматику, лексику и произношение.",
  ios: "Ты консультант по iPhone и iOS. Объясняй реальные возможности системы и Shortcuts. Не утверждай, что управляешь телефоном без интеграции.",
  memory: "Помогай структурировать предоставленный пользователем контекст. Не заявляй о постоянном сохранении памяти без соответствующей функции.",
  projects: "Ты архитектор программных проектов. Создавай понятную структуру, план разработки и тестирования приложений и сайтов.",
  agents: "Ты координатор специалистов. Разделяй сложную задачу на направления и объединяй результаты в один ответ.",
  research: "Ты исследователь. Анализируй аргументы, сравнивай варианты и обозначай неопределённость.",
  security: "Ты специалист по защите данных и приватности. Помогай хранить секреты безопасно и выявлять риски.",
  evolution: "Ты анализируешь качество собственных ответов, предлагаешь улучшения и тесты. Не меняй настройки и права без разрешения пользователя."
};

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    assistant: "JARVIS 2.0 ULTIMATE",
    aiConfigured: Boolean(client)
  });
});

app.post("/api/ask", async (req, res) => {
  try {
    if (!client) {
      return res.status(503).json({
        error: "ИИ пока не подключён. Сначала настрой OPENAI_API_KEY на сервере."
      });
    }

    const { message, mode = "general", history = [] } = req.body || {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Напиши сообщение."
      });
    }

    if (message.length > 8000) {
      return res.status(413).json({
        error: "Сообщение слишком длинное."
      });
    }

    const safeMode = Object.hasOwn(instructions, mode)
      ? mode
      : "general";

    const safeHistory = Array.isArray(history)
      ? history
          .filter(item =>
            item &&
            ["user", "assistant"].includes(item.role) &&
            typeof item.content === "string"
          )
          .slice(-10)
          .map(item => ({
            role: item.role,
            content: item.content.slice(0, 8000)
          }))
      : [];

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1",
      instructions:
        instructions[safeMode] +
        "\nБудь честен о своих возможностях. Не выдумывай выполненные действия, поиск, интеграции или результаты инструментов. Важные действия требуют подтверждения пользователя.",
      input: [
        ...safeHistory,
        {
          role: "user",
          content: message.trim()
        }
      ],
      max_output_tokens: 2000
    });

    res.json({
      answer: response.output_text || "Не удалось сформировать ответ."
    });

  } catch (error) {
    console.error("JARVIS server error:", error.message);

    res.status(500).json({
      error: "Внутренняя ошибка сервера. Попробуй позже."
    });
  }
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`JARVIS запущен на порту ${PORT}`);
});
