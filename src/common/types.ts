import { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import { Context } from "grammy";

export enum SearchFilters {
    TITLE = "200_A",
    AUTHOR = "200_F",
    PUBLISHER = "210_C",
    SERIES = "225_A",
    SUBSERIES = "225_I",
    ISSUE_NUMBER = "207_A",
    UDC_TABLE = "675_A",
    LBC_INDEX = "902_A",
    UDC_INDEX = "901_A",
    SHELF_INDEX = "COTE",
    HEADING = "SUJET",
    BARCODE = "CODBARE",
    INVENTORY_NUMBER = "INVENTAIRE",
    LANGUAGE = "101_A",
    PUBLISHER_PLACE = "210_A",
    THESAURUS = "THESAURUS",
    GENRE = "RGNR_A",
    ISBN = "010_A",
    CONTENT = "327_A",
    SECTION = "SECTION"
}

export type SearchForm = Partial<Record<SearchFilters, string>>;

export interface Document {
    IdNotice: string;
    Categ: string;
    Auteur: string;
    Titre: string;
    Editeur: string;
    Date: string;
    ISBN: string;
    Cote: string;
    URL: string;
    Resevre: string;
    RowNumber: string;
    Image: string;
    Libelle: string;
    noticeAnnexe: string;
    total: string;
    availible: string;
    pretable: string;
}

export interface SearchResponse {
    "?xml": "";
    Notices?: { source: { notice: Document[] } };
    error?: string;
}

export type ConvFlavorContext = ConversationFlavor<Context>;
export type ConversationContext = Context;
export type ConversationType = Conversation<ConvFlavorContext, ConversationContext>;

export enum Conversations {
    SEARCH_FORM = "search-form"
}
