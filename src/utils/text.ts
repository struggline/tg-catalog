export function escapeMarkdownSymbols(str: string) {
    return str.replace(/[_*\[\]()~`>#+\-=\|{}.!]/g, "\\$&");
}
