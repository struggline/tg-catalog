import { ConversationMenu, conversations, createConversation, type ConversationFlavor } from "@grammyjs/conversations";
import dotenv from "dotenv";
import { XMLParser } from "fast-xml-parser";
import { Bot, type Context } from "grammy";
import { Message } from "grammy/types";
import { filterLabels, filterPrompts } from "./common/const";
import {
    ConversationContext,
    Conversations,
    ConversationType,
    SearchFilters,
    SearchForm,
    SearchResponse
} from "./common/types";
import { createRequestFormData } from "./utils/form-data";
import { getFormMessage } from "./utils/form-text";

dotenv.config();

const bot = new Bot<ConversationFlavor<Context>>(process.env.BOT_TOKEN!);

bot.use(conversations());
bot.command("clear", async (ctx) => {
    await ctx.conversation.exit(Conversations.SEARCH_FORM);
    await ctx.reply("*Поиск успешно сброшен\\!*\n\nЧтобы начать новый поиск, импользуйте команду /newsearch", {
        parse_mode: "MarkdownV2"
    });
});

async function searchForm(conversation: ConversationType, ctx: ConversationContext) {
    const filters = Object.values(SearchFilters);
    let form: SearchForm = {};
    let filterPage = 0;
    const maxFilterButtons = 4;
    const lastFilterPage = Math.floor(filters.length / maxFilterButtons) - 1;

    let resultPage = 0;
    const maxResultButtons = 6;

    let formMessage: Message.TextMessage | undefined;
    let docDescriptionMessage: Message.TextMessage | undefined;

    function addMenuPage(menu: ConversationMenu<Context>) {
        for (
            let i = filterPage * maxFilterButtons;
            i < filterPage * maxFilterButtons + maxFilterButtons && i < filters.length;
            i++
        ) {
            const filter = filters[i];

            menu = menu.text(
                () => filterLabels[filter],
                async (ctx) => {
                    if (Object.values(form).filter(Boolean).length >= 4) {
                        return await ctx.reply(
                            "*Достигнуто максимальное количество фильтров\\!*\n\nВыполните поиск или отмените текущий с помощью /clear",
                            {
                                parse_mode: "MarkdownV2"
                            }
                        );
                    }

                    const prompt = await ctx.reply(filterPrompts[filter]);
                    const response = await conversation.form.text({
                        action: (ctx) => ctx.deleteMessage()
                    });

                    if (form[filter] === response) {
                        return await ctx.api.deleteMessage(ctx.chatId!, prompt.message_id);
                    }
                    form[filter] = response;

                    await Promise.all([
                        ctx.api.deleteMessage(ctx.chatId!, prompt.message_id),
                        formMessage
                            ? ctx.api.editMessageText(ctx.chatId!, formMessage.message_id, getFormMessage(form), {
                                  reply_markup: menu,
                                  parse_mode: "MarkdownV2"
                              })
                            : null
                    ]);
                }
            );

            if (i % 2 !== 0) menu = menu.row();
        }

        menu = menu.row();
        menu = addControlButton(menu, "back", filterPage === 0);
        menu = addControlButton(menu, "next", filterPage === lastFilterPage);
        menu = menu.row().text("Поиск 🔎", async (ctx) => {
            const formData = createRequestFormData(form);

            const res = await fetch("https://elcat.bntu.by/index.php?url=/SearchForms/simpleSearch", {
                method: "POST",
                body: formData
            });

            const data = await res.text();
            const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
            const jsonRes = parser.parse(data) as SearchResponse;
            const documents = jsonRes.Notices?.source?.notice ?? [];
            const lastResultPage = Math.max(Math.floor(documents.length / maxResultButtons) - 1, 0);

            if (jsonRes.error) {
                await ctx.reply(jsonRes.error);
                await Promise.all([
                    formMessage ? ctx.api.deleteMessage(ctx.chatId!, formMessage.message_id) : null,
                    conversation.halt()
                ]);
                return;
            }

            //----------------------------------------RESPONSE MENU------------------------------------------//

            function addMenuPage(menu: ConversationMenu<Context>) {
                for (
                    let i = resultPage * maxResultButtons;
                    i < resultPage * maxResultButtons + maxResultButtons && i < documents.length;
                    i++
                ) {
                    const document = documents[i];

                    menu = menu
                        .text(
                            () => document.Titre,
                            async (ctx) => {
                                const res = await fetch(
                                    `https://elcat.bntu.by/index.php?url=/notices/getIsbdAjax/${document.IdNotice}/default&IdNotice=${document.IdNotice}&source=default`,
                                    {
                                        headers: {
                                            "x-requested-with": "XMLHttpRequest"
                                        }
                                    }
                                );
                                const html = await res.text();
                                const parsed = html
                                    .replace(/<\/?div\b[^>]*>/gi, "")
                                    .replace(/<br\s*\/?>/gi, "\n")
                                    .replace(/index.php/gi, "https://elcat.bntu.by/index.php/");

                                const description =
                                    (document.URL
                                        ? `<b><a href="${document.URL}">Ссылка на документ в репозитории БНТУ</a></b>\n`
                                        : "") + parsed;

                                if (docDescriptionMessage) {
                                    await ctx.api.editMessageText(
                                        ctx.chatId!,
                                        docDescriptionMessage.message_id,
                                        description,
                                        {
                                            parse_mode: "HTML"
                                        }
                                    );
                                } else {
                                    docDescriptionMessage = await ctx.reply(description, {
                                        parse_mode: "HTML"
                                    });
                                }
                            }
                        )
                        .row();
                }

                menu = addControlButton(menu, "back", resultPage === 0);
                menu = addControlButton(menu, "next", resultPage === lastResultPage);
            }

            function addControlButton(menu: ConversationMenu<Context>, dir: "back" | "next", disabled?: boolean) {
                return menu.text(disabled ? " " : dir === "back" ? "◀" : "▶", async (ctx) => {
                    if (disabled) return;
                    let menu = conversation.menu();

                    resultPage += dir === "back" ? -1 : 1;
                    addMenuPage(menu);

                    if (formMessage) {
                        await ctx.api.editMessageReplyMarkup(ctx.chatId!, formMessage.message_id, {
                            reply_markup: menu
                        });
                    }
                });
            }

            let menu = conversation.menu();
            addMenuPage(menu);

            if (formMessage) {
                await ctx.api.editMessageText(ctx.chatId!, formMessage.message_id, "*Найденные результаты:*", {
                    reply_markup: menu,
                    parse_mode: "MarkdownV2"
                });
            } else {
                await ctx.reply("*Найденные результаты:*", {
                    reply_markup: menu,
                    parse_mode: "MarkdownV2"
                });
            }

            //-----------------------------------------------------------------------------------------------//
        });
    }

    function addControlButton(menu: ConversationMenu<Context>, dir: "back" | "next", disabled?: boolean) {
        return menu.text(disabled ? " " : dir === "back" ? "◀" : "▶", async (ctx) => {
            if (disabled) return;
            let menu = conversation.menu();

            filterPage += dir === "back" ? -1 : 1;
            addMenuPage(menu);

            if (formMessage) {
                await ctx.api.editMessageReplyMarkup(ctx.chatId!, formMessage.message_id, {
                    reply_markup: menu
                });
            }
        });
    }

    let menu = conversation.menu();
    addMenuPage(menu);

    formMessage = await ctx.reply(getFormMessage(form), {
        reply_markup: menu,
        parse_mode: "MarkdownV2"
    });

    await conversation.waitUntil((_) => false, {
        otherwise: (ctx) =>
            ctx.reply("*Используйте кнопки в сообщении выше\\!*\n\nИли отмените поиск с помощью /clear", {
                parse_mode: "MarkdownV2"
            })
    });
}

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
