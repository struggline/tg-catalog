import { filterLabels } from "../common/const";
import { SearchFilters, SearchForm } from "../common/types";
import { escapeMarkdownSymbols } from "./text";

export function getFormMessage(form: SearchForm) {
    const entries = Object.entries(form) as [SearchFilters, string][];

    return (
        `*Собираем поисковой запрос\\!*\n\n${
            entries.length > 0 ? "Текущие фильтры" : "Выберите интересующие Вас фильтры"
        }:\n` +
        entries
            .map(([filter, value]) => {
                return `__${filterLabels[filter]}:__ _${escapeMarkdownSymbols(value)}_\n`;
            })
            .join("") +
        (entries.length >= 4 ? "\n\nМаксимальное количество фильтров достигнуто\\.\n*Начините поиск*" : "")
    );
}
