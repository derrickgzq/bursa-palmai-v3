import * as React from "react"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function SelectScrollable({ onChange }: { onChange: (value: string) => void }) {
    return (
        <Select onValueChange={onChange}>
            <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Bursa Malaysia listed</SelectLabel>

                    <SelectItem value="KLK">Kuala Lumpur Kepong Berhad</SelectItem>
                    <SelectItem value="IOICORP">IOI Corporation Berhad</SelectItem>
                    <SelectItem value="UMCCA">United Malacca Berhad</SelectItem>
                    <SelectItem value="PLS">PLS Plantations Berhad</SelectItem>
                    <SelectItem value="CEPAT">Cepatwawasan Group Berhad</SelectItem>
                    <SelectItem value="BKAWAN">Batu Kawan Berhad</SelectItem>
                    <SelectItem value="JPG">Johor Plantations Group Berhad</SelectItem>
                    <SelectItem value="INNO">Innoprise Plantations Berhad</SelectItem>
                    <SelectItem value="DUTALND">Dutaland Berhad</SelectItem>
                    <SelectItem value="INCKEN">Inch Kenneth Kajang Rubber PLC</SelectItem>
                    <SelectItem value="TDM">TDM Berhad</SelectItem>
                    <SelectItem value="SWKPLNT">Sarawak Plantation Berhad</SelectItem>
                    <SelectItem value="NSOP">Negri Sembilan Oil Palms Berhad</SelectItem>
                    <SelectItem value="TSH">TSH Resources Berhad</SelectItem>
                    <SelectItem value="DSR">DSR Taiko Berhad</SelectItem>
                    <SelectItem value="RVIEW">Riverview Rubber Estates Berhad</SelectItem>
                    <SelectItem value="NPC">NPC Resources Berhad</SelectItem>
                    <SelectItem value="MALPAC">Malpac Holdings Berhad</SelectItem>
                    <SelectItem value="KMLOONG">Kim Loong Resources Berhad</SelectItem>
                    <SelectItem value="MENTIGA">Mentiga Corporation Bhd</SelectItem>
                    <SelectItem value="KRETAM">Kretam Holdings Berhad</SelectItem>
                    <SelectItem value="SHCHAN">Sin Heng Chan (Malaya) Berhad</SelectItem>
                    <SelectItem value="GLBHD">Golden Land Berhad</SelectItem>
                    <SelectItem value="THPLANT">TH Plantations Berhad</SelectItem>
                    <SelectItem value="MATANG">Matang Berhad</SelectItem>
                    <SelectItem value="AASIA">Astral Asia Berhad</SelectItem>
                    <SelectItem value="MKHOP">MKH Oil Palm (East Kalimantan) Berhad</SelectItem>
                    <SelectItem value="JTIASA">Jaya Tiasa Holdings Bhd</SelectItem>
                    <SelectItem value="BLDPLNT">BLD Plantation Bhd.</SelectItem>
                    <SelectItem value="CHINTEK">Chin Teck Plantations Berhad</SelectItem>
                    <SelectItem value="PINEPAC">Pinehill Pacific Berhad</SelectItem>
                    <SelectItem value="RSAWIT">Rimbunan Sawit Berhad</SelectItem>
                    <SelectItem value="MHC">MHC Plantations Bhd</SelectItem>
                    <SelectItem value="FGV">FGV Holdings Berhad</SelectItem>
                    <SelectItem value="TAANN">Ta Ann Holdings Berhad</SelectItem>
                    <SelectItem value="FAREAST">Far East Holdings Bhd</SelectItem>
                    <SelectItem value="GOPENG">Gopeng Berhad</SelectItem>
                    <SelectItem value="SOP">Sarawak Oil Palms Berhad</SelectItem>
                    <SelectItem value="GENP">Genting Plantations Berhad</SelectItem>
                    <SelectItem value="HSPLANT">Hap Seng Plantations Holdings</SelectItem>
                    <SelectItem value="SBAGAN">Sungei Bagan Rubber Co (M) Bhd</SelectItem>
                    <SelectItem value="HARNLEN">Harn Len Corporation Bhd</SelectItem>
                    <SelectItem value="SDG">SD Guthrie Berhad</SelectItem>
                    <SelectItem value="UTDPLT">United Plantations Berhad</SelectItem>
                    <SelectItem value="KLUANG">Kluang Rubber Company (Malaya) Berhad</SelectItem>
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Indonesia listed</SelectLabel>
                    <SelectItem value="art">PT Provident Investasi Bersama Tbk</SelectItem>
                    <SelectItem value="bot">PT Sumber Tani Agung Resources Tbk</SelectItem>
                    <SelectItem value="brt">PT Agro Bahari Nusantara Tbk</SelectItem>
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Thailand listed</SelectLabel>
                    <SelectItem value="uvic">Asian Palm Oil Public Company Limited</SelectItem>
                    <SelectItem value="uvoc">United Palm Oil Industry Public Company Limited</SelectItem>
                    <SelectItem value="uvec">Univanich Palm Oil Public Company Limited</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
