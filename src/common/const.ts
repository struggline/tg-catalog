import { SearchFilters } from "./types";

export const filterLabels: Record<SearchFilters, string> = {
    [SearchFilters.TITLE]: "Заглавие",
    [SearchFilters.AUTHOR]: "Автор",
    [SearchFilters.PUBLISHER]: "Издательство",
    [SearchFilters.SERIES]: "Серия",
    [SearchFilters.SUBSERIES]: "Подсерия",
    [SearchFilters.ISSUE_NUMBER]: "Номер выпуска",
    [SearchFilters.UDC_TABLE]: "Таблица УДК",
    [SearchFilters.LBC_INDEX]: "Индекс ББК",
    [SearchFilters.UDC_INDEX]: "Индекс УДК",
    [SearchFilters.SHELF_INDEX]: "Полочный индекс",
    [SearchFilters.HEADING]: "Рубрика",
    [SearchFilters.BARCODE]: "Штрих-код",
    [SearchFilters.INVENTORY_NUMBER]: "Инвентраный N",
    [SearchFilters.LANGUAGE]: "Язык",
    [SearchFilters.PUBLISHER_PLACE]: "Место издания",
    [SearchFilters.THESAURUS]: "Тезаурус",
    [SearchFilters.GENRE]: "Жанр",
    [SearchFilters.ISBN]: "ISBN",
    [SearchFilters.CONTENT]: "Примечание",
    [SearchFilters.SECTION]: "Секция"
};

export const filterPrompts: Record<SearchFilters, string> = {
    [SearchFilters.TITLE]: "Введите заглавие желаемого документа",
    [SearchFilters.AUTHOR]: "Введите автора желаемого документа",
    [SearchFilters.PUBLISHER]: "Введите издательство желаемого документа",
    [SearchFilters.SERIES]: "Введите серию желаемого документа",
    [SearchFilters.SUBSERIES]: "Введите подсерию желаемого документа",
    [SearchFilters.ISSUE_NUMBER]: "Введите номер выпуска желаемого документа",
    [SearchFilters.UDC_TABLE]: "Введите таблицу УДК желаемого документа",
    [SearchFilters.LBC_INDEX]: "Введите индекс ББК желаемого документа",
    [SearchFilters.UDC_INDEX]: "Введите индекс УДК (без таблицы) желаемого документа",
    [SearchFilters.SHELF_INDEX]: "Введите полочный индекс желаемого документа",
    [SearchFilters.HEADING]: "Введите рубрику желаемого документа",
    [SearchFilters.BARCODE]: "Введите штрих-код желаемого документа",
    [SearchFilters.INVENTORY_NUMBER]: "Введите инвентарный номер желаемого документа",
    [SearchFilters.LANGUAGE]: "Введите язык желаемого документа",
    [SearchFilters.PUBLISHER_PLACE]: "Введите место издания желаемого документа",
    [SearchFilters.THESAURUS]: "Введите название тезауруса желаемого документа",
    [SearchFilters.GENRE]: "Введите литературный жанр желаемого документа",
    [SearchFilters.ISBN]: "Введите ISBN желаемого документа",
    [SearchFilters.CONTENT]: "Введите примечание о содержании желаемого документа",
    [SearchFilters.SECTION]: "Введите секцию желаемого документа"
};
