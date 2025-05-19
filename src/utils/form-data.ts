import { SearchFilters } from "../common/types";

export function createRequestFormData(filters: Partial<Record<SearchFilters, string>>) {
    const formData = new FormData();

    for (const [filter, value] of Object.entries(defaultFormValues)) {
        if (Array.isArray(value)) {
            for (const v of value) {
                formData.append(filter, v);
            }
        } else {
            formData.append(filter, value);
        }
    }

    let filterIdx = 1;
    for (const [filter, value] of Object.entries(filters) as [SearchFilters, string][]) {
        if (filterIdx > 4) break;

        formData.set(`data[${filterIdx}][field]`, filter);
        formData.set(`data[${filterIdx}][value]`, value);
        filterIdx++;
    }

    return formData;
}

const defaultFormValues = {
    _method: "POST",
    "data[1][oper]": "AND",
    "data[1][field]": "200_A",
    "data[1][value]": "",
    "data[2][oper]": "AND",
    "data[2][field]": "200_F",
    "data[2][value]": "",
    "data[3][oper]": "AND",
    "data[3][field]": "200_A",
    "data[3][value]": "",
    "data[4][oper]": "AND",
    "data[4][field]": "200_F",
    "data[4][value]": "",
    "data[5][oper]": "AND",
    "data[5][field]": "225_I",
    "data[5][value]": "",
    "data[between][210_D][start]": "",
    "data[between][210_D][end]": "",
    "data[exist][856_U]": "0",
    "data[Notice][Categ][all]": ["0", "1"],
    "data[Notice][Categ][1]": "0",
    "data[Notice][Categ][4]": "0",
    "data[Notice][Categ][5]": "0",
    "data[Notice][Categ][6]": "0",
    "data[Notice][Categ][7]": "0",
    "data[Notice][Categ][9]": "0",
    "data[Notice][Categ][14]": "0",
    "data[Notice][Categ][18]": "0",
    "data[Notice][Categ][26]": "0",
    "data[Notice][Categ][30]": "0",
    "data[Notice][Categ][31]": "0",
    "data[Notice][Categ][32]": "0",
    "data[Notice][Categ][35]": "0",
    "data[Notice][Categ][36]": "0",
    "data[Notice][Categ][40]": "0",
    "data[Notice][Categ][41]": "0",
    "data[Notice][Categ][43]": "0",
    "data[Notice][Categ][44]": "0",
    "data[libs][default][all]": ["0", "1"],
    "data[libs][default][1]": "0",
    "data[libs][default][53]": "0",
    "data[libs][default][81]": "0",
    "data[libs][default][52]": "0",
    "data[libs][default][116]": "0",
    "data[libs][default][112]": "0",
    "data[libs][default][102]": "0",
    "data[libs][default][103]": "0",
    "data[libs][default][38]": "0",
    "data[libs][default][29]": "0",
    "data[libs][default][37]": "0",
    "data[libs][default][94]": "0",
    "data[libs][default][59]": "0",
    "data[libs][default][115]": "0",
    "data[libs][default][109]": "0",
    "data[libs][default][54]": "0",
    "data[libs][default][117]": "0",
    "data[libs][default][101]": "0",
    "data[libs][default][100]": "0",
    "data[libs][default][110]": "0",
    "data[libs][default][98]": "0",
    "data[libs][default][96]": "0",
    "data[libs][default][87]": "0",
    "data[libs][default][86]": "0",
    "data[libs][default][108]": "0",
    "data[libs][default][90]": "0",
    "data[libs][default][6]": "0",
    "data[libs][default][92]": "0",
    "data[libs][default][22]": "0",
    "data[libs][default][33]": "0",
    "data[libs][default][78]": "0",
    "data[libs][default][9]": "0",
    "data[libs][default][113]": "0",
    "data[libs][default][56]": "0",
    "data[libs][default][5]": "0",
    "data[libs][default][104]": "0",
    "data[libs][default][7]": "0",
    "data[libs][default][15]": "0",
    "data[libs][default][4]": "0",
    "data[libs][default][79]": "0",
    "data[libs][default][20]": "0",
    "data[libs][default][39]": "0",
    "data[libs][default][107]": "0",
    "data[libs][default][3]": "0",
    "data[libs][default][8]": "0",
    "data[libs][default][2]": "0",
    "data[libs][default][41]": "0",
    "data[libs][default][45]": "0",
    "data[libs][default][80]": "0",
    "data[libs][default][23]": "0",
    "data[libs][default][17]": "0",
    "data[libs][default][10]": "0",
    "data[libs][default][11]": "0",
    "data[libs][default][12]": "0",
    "data[libs][default][13]": "0",
    "data[libs][default][14]": "0",
    "data[libs][default][24]": "0",
    "data[libs][default][21]": "0",
    "data[libs][default][84]": "0",
    "data[libs][default][16]": "0",
    "data[libs][default][114]": "0"
};
