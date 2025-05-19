import { conversations, createConversation, type ConversationFlavor } from "@grammyjs/conversations";
import dotenv from "dotenv";
import { Bot, type Context } from "grammy";
import { Conversations } from "./common/types";
import { searchForm } from "./conversation";

dotenv.config();

const bot = new Bot<ConversationFlavor<Context>>(process.env.BOT_TOKEN!);

bot.use(conversations());
bot.command("clear", async (ctx) => {
    await ctx.conversation.exit(Conversations.SEARCH_FORM);
    await ctx.reply("*Поиск успешно сброшен\\!*\n\nЧтобы начать новый поиск, импользуйте команду /newsearch", {
        parse_mode: "MarkdownV2"
    });
});

bot.use(createConversation(searchForm, Conversations.SEARCH_FORM));

bot.command("start", async (ctx) => {
    await ctx.conversation.exit(Conversations.SEARCH_FORM);
    await ctx.conversation.enter(Conversations.SEARCH_FORM);
});
bot.command("newsearch", async (ctx) => {
    await ctx.conversation.exit(Conversations.SEARCH_FORM);
    await ctx.conversation.enter(Conversations.SEARCH_FORM);
});

bot.catch(async (err) => {
    const ctx = err.ctx;
    const e = err.error;
    console.error(`Error while handling update ${ctx.update.update_id}: ${e}`);

    await err.ctx.reply(
        "*Упс\\!*\nПроизошла непредвиденная ошибка\\.\\.\\. Пожалуйста, воспользуйтесь командой /clear",
        {
            parse_mode: "MarkdownV2"
        }
    );
});

bot.start();
