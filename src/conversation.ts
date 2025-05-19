import { ConversationMenu, ConversationMenuContext } from "@grammyjs/conversations";
import { XMLParser } from "fast-xml-parser";
import { Context } from "grammy";
import { Message } from "grammy/types";
import { filterLabels, filterPrompts } from "./common/const";
import { ConversationContext, ConversationType, SearchFilters, SearchForm, SearchResponse } from "./common/types";
import { createRequestFormData } from "./utils/form-data";
import { getFormMessage } from "./utils/form-text";
import { callAi } from "./ai/request";
import { OpenAiRequest } from "./ai/types";

export async function searchForm(conversation: ConversationType, ctx: ConversationContext) {
    const filters = Object.values(SearchFilters);
    let form: SearchForm = {};
    let filterPage = 0;
    const maxFilterButtons = 4;
    const lastFilterPage = Math.floor(filters.length / maxFilterButtons) - 1;

    let formMessage: Message.TextMessage | undefined;

    function addMenuPage() {
        let menu = conversation.menu();

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
            await searchButtonHandler(conversation, ctx, form, formMessage);
        });

        return menu;
    }

    function addControlButton(menu: ConversationMenu<Context>, dir: "back" | "next", disabled?: boolean) {
        return menu.text(disabled ? " " : dir === "back" ? "◀ Назад" : "Далее ▶", async (ctx) => {
            if (disabled) return;

            filterPage += dir === "back" ? -1 : 1;
            const menu = addMenuPage();

            if (formMessage) {
                await ctx.api.editMessageReplyMarkup(ctx.chatId!, formMessage.message_id, {
                    reply_markup: menu
                });
            }
        });
    }

    const menu = addMenuPage();

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

async function searchButtonHandler(
    conversation: ConversationType,
    ctx: ConversationMenuContext<Context>,
    form: SearchForm,
    formMessage: Message.TextMessage | undefined
) {
    let resultPage = 0;
    const maxResultButtons = 6;
    let docDescriptionMessage: Message.TextMessage | undefined;

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

    function createMenuPage() {
        let menu = conversation.menu();

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

                        const menu = conversation.menu().text("Начать чат с ИИ", async (ctx) => {
                            await chatButtonHandler(conversation, ctx, description);
                        });

                        try {
                            if (docDescriptionMessage) {
                                await ctx.api.editMessageText(
                                    ctx.chatId!,
                                    docDescriptionMessage.message_id,
                                    description,
                                    {
                                        reply_markup: menu,
                                        parse_mode: "HTML"
                                    }
                                );
                            } else {
                                docDescriptionMessage = await ctx.reply(description, {
                                    reply_markup: menu,
                                    parse_mode: "HTML"
                                });
                            }
                        } catch (err) {
                            console.error(err);
                            await ctx.reply("Выбранный документ не может быть отображен");
                        }
                    }
                )
                .row();
        }

        function addControlButton(menu: ConversationMenu<Context>, dir: "back" | "next", disabled?: boolean) {
            return menu.text(disabled ? " " : dir === "back" ? "◀ Назад" : "Далее ▶", async (ctx) => {
                if (disabled) return;

                resultPage += dir === "back" ? -1 : 1;
                const menu = createMenuPage();

                if (formMessage) {
                    await ctx.api.editMessageReplyMarkup(ctx.chatId!, formMessage.message_id, {
                        reply_markup: menu
                    });
                }
            });
        }

        menu = addControlButton(menu, "back", resultPage === 0);
        menu = addControlButton(menu, "next", resultPage === lastResultPage);

        return menu;
    }

    const menu = createMenuPage();

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
}

async function chatButtonHandler(
    conversation: ConversationType,
    ctx: ConversationMenuContext<Context>,
    documentDescription: string
) {
    let history: Pick<OpenAiRequest, "history">["history"] = [
        {
            role: "system" as const,
            content:
                `Always answer in russian. Always answer with plain text without markdown or any other formatting. You are the librarian in the Belarusian National Technical University.
            You need to assist user with any questions about document. The description of the document is represented as HTML: ` +
                documentDescription +
                "\nNow write a welcome message to the user"
        }
    ];

    const response = await callAi({
        key: process.env.OPEN_AI_KEY!,
        history
    });

    await ctx.reply("*Вы начали чат с ИИ\\!*\n\nДля выхода из чата используйте /clear", {
        parse_mode: "MarkdownV2"
    });
    await ctx.reply(response.choices[0].message.content);

    history.push({
        role: "assistant",
        content: response.choices[0].message.content
    });

    while (true) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const userMessage = await conversation.form.text({
            otherwise: (ctx) => ctx.reply("Пожалуйста, отправьте текстовое сообщение")
        });

        const loadingMsg = await ctx.reply("Ожидайте...");

        history.push({
            role: "user",
            content: userMessage
        });

        const botResponse = await callAi({
            key: process.env.OPEN_AI_KEY!,
            history
        });

        await Promise.all([
            ctx.api.deleteMessage(ctx.chatId!, loadingMsg.message_id),
            ctx.reply(botResponse.choices[0].message.content)
        ]);
    }
}
