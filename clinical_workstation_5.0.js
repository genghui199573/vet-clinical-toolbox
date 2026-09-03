"use strict";
/* Vet Clinical Toolbox 5.0-r08 · Clinical Workstation Extension
 * Decision support only. No invented product-specific doses.
 */
(function(){
const $=id=>document.getElementById(id);
const n=id=>{const x=parseFloat($(id)?.value);return Number.isFinite(x)?x:null};
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
const out=(id,html)=>{if($(id))$(id).innerHTML=html};

const protocols={
"猫上呼吸道感染": ["猫",["感染性上呼吸道疾病","疱疹病毒","杯状病毒"],["呼吸频率/呼吸困难红旗","口腔溃疡与鼻分泌物","脱水与营养摄入","必要时病毒/细菌检测"],["体温、呼吸、食欲、脱水","重症考虑胸部影像/氧疗评估"],["呼吸困难、张口呼吸、严重脱水、持续不进食"],"支持治疗优先；抗菌药需有细菌感染依据。"],
"猫口炎": ["猫",["慢性牙龈口炎","口腔炎症"],["口腔完整检查与牙科影像","评估FIV/FeLV等基础病","疼痛和营养状态"],["疼痛评分、体重、进食","必要时血常规/生化"],["无法进食、严重疼痛、脱水、出血"],"多模式镇痛、口腔卫生和牙科治疗是核心；免疫调节方案需个体化。"],
"猫哮喘": ["猫",["猫支气管疾病","下呼吸道疾病"],["呼吸模式、胸片/POCUS","排除心源性与胸腔疾病","必要时气道采样"],["RR、SpO2、呼吸功","治疗后动态复查"],["张口呼吸、紫绀、疲劳、无法平卧"],"急性期先稳定气道和氧合，再处理炎症/支气管痉挛。"],
"猫心肌病": ["猫",["HCM","限制型心肌病"],["心超、血压、ECG","胸片/NT-proBNP按场景","评估血栓风险"],["呼吸频率、血压、肾功能、电解质"],["肺水肿、动脉血栓、严重低血压/晕厥"],"治疗取决于表型、充血状态和血栓风险，不应按单一方案套用。"],
"猫甲状腺功能亢进": ["猫",["甲亢"],["总T4/游离T4按需","血压、肾功能、心脏评估"],["体重、HR、血压、肾指标"],["严重高血压、心衰、持续呕吐/脱水"],"治疗方案需结合肾脏和心血管状态。"],
"猫糖尿病": ["猫",["糖尿病","应激性高血糖鉴别"],["血糖、尿糖/酮体、果糖胺按需","评估DKA红旗"],["血糖趋势、体重、饮水、尿酮体"],["酮症、呕吐、脱水、精神沉郁"],"饮食、胰岛素和家庭监测应形成闭环。"],
"猫急性肾损伤": ["猫",["AKI"],["CBC、生化、电解质、尿检、尿比重","影像排除梗阻"],["UOP、肌酐/尿素氮、电解质、体重、液体平衡"],["无尿/少尿、严重高钾、肺水肿、尿毒症"],"先处理可逆原因和灌注；补液不能脱离尿量和容量状态。"],
"猫慢性肾病": ["猫",["CKD","慢性肾衰"],["IRIS分期所需指标、血压、尿蛋白","磷、钾、酸碱、贫血评估"],["体重、食欲、血压、肌酐/SDMA、磷、UPC"],["危象性高钾、严重脱水、尿毒症、肺水肿"],"按IRIS分期管理，重点是营养、血压、蛋白尿、磷和症状控制。"],
"猫下尿路疾病": ["猫",["FLUTD","特发性膀胱炎","尿石症"],["尿检、尿培养按适应证、影像","必须排除尿道梗阻"],["排尿频率、疼痛、尿量、血钾/肾指标"],["尿闭、严重高钾、膀胱过度充盈、虚弱"],"先识别尿闭；非梗阻病例重点是疼痛、环境和饮水管理。"],
"猫尿道梗阻": ["猫",["尿闭","FLUTD急症"],["血钾/ECG、肾指标、膀胱检查","稳定循环后解除梗阻"],["ECG、K、UOP、酸碱、体重"],["高钾、心律失常、低血压、昏迷"],"这是急症；不要在高钾风险下盲目补钾。"],
"猫脂肪肝": ["猫",["肝脂质沉积"],["肝胆超声、生化、凝血","评估基础病与营养缺口"],["体重、胆红素、肝酶、K/P/Mg、凝血"],["持续不进食、低钾、低磷、凝血异常"],"营养支持是核心，纠正电解质和基础疾病。"],
"猫胆管炎": ["猫",["胆管炎/胆管肝炎"],["CBC、生化、胆红素、腹部超声","培养/细胞学按适应证"],["胆红素、肝酶、体温、食欲、凝血"],["胆道梗阻、败血症、凝血障碍"],"感染证据充分时针对性抗菌；胆道梗阻需要外科/介入评估。"],
"猫胰腺炎": ["猫",["胰腺炎"],["临床评分、fPLI按场景、超声","排查胆道/肝肠联合疾病"],["疼痛、呕吐、进食、体重、水合、电解质"],["休克、持续呕吐、低钙、胆道梗阻"],"以疼痛、恶心、营养和液体状态管理为核心。"],
"犬细小病毒病": ["犬",["CPV肠炎"],["粪便抗原/PCR按场景、CBC、生化、电解质","评估败血症和低血糖风险"],["体重、灌注、葡萄糖、K/Na、CBC、粪便与呕吐"],["休克、低血糖、严重中性粒细胞减少、持续呕吐"],"隔离、液体与电解质、营养、止吐和感染控制是核心。"],
"犬瘟热": ["犬",["CDV"],["PCR/抗原按场景、神经/呼吸/消化系统评估","并发感染评估"],["体温、神经状态、呼吸、营养"],["癫痫、呼吸衰竭、意识障碍"],"以支持治疗和并发症控制为主；抗菌药针对继发感染而非病毒本身。"],
"犬急性胃肠炎": ["犬",["急性呕吐腹泻"],["先排除梗阻、中毒、胰腺炎和系统性疾病","CBC/生化按严重程度"],["水合、体重、粪便、呕吐、腹痛"],["血便、休克、持续呕吐、严重腹痛、异物风险"],"先排除急腹症，再进行液体、止吐、营养和病因治疗。"],
"犬胰腺炎": ["犬",["胰腺炎"],["cPLI按场景、CBC、生化、超声","评估胆道、糖代谢和并发症"],["疼痛、呕吐、进食、体重、灌注"],["休克、DIC、严重低钙、持续呕吐"],"多模式镇痛、止吐、早期适当营养和个体化液体治疗。"],
"犬MMVD": ["犬",["二尖瓣黏液样变性","慢性瓣膜病"],["心超/胸片、血压、肾功能","按ACVIM分期"],["RR、咳嗽、体重、肾指标、电解质"],["肺水肿、晕厥、严重低血压/肾损伤"],"按分期管理；药物选择和剂量必须与分期及当前标签一致。"],
"犬DCM": ["犬",["扩张型心肌病"],["心超、ECG、胸片、血压","必要时Holter"],["HR、ECG、呼吸频率、肾功能、电解质"],["恶性心律失常、肺水肿、晕厥"],"重点是心衰与心律失常风险分层。"],
"犬CKD": ["犬",["慢性肾病"],["IRIS分期、UPC、血压、磷、钾、酸碱","评估贫血与尿毒症"],["体重、食欲、血压、肌酐/SDMA、磷、UPC"],["尿毒症危象、高钾、肺水肿、严重脱水"],"分期管理，重点处理营养、磷、血压、蛋白尿和症状。"],
"犬Addison": ["犬",["肾上腺皮质功能减退"],["电解质、皮质醇/ACTH刺激试验按场景","排除其他休克原因"],["Na/K、血糖、血压、ECG、体重"],["休克、严重高钾、低血糖、心律失常"],"急性危象先稳定循环和电解质，再建立长期替代治疗。"],
"犬Cushing": ["犬",["垂体/肾上腺依赖性高皮质醇"],["LDDST/ACTH刺激、超声等按场景","评估高血压、糖尿病、血栓风险"],["体重、血压、肝酶、血糖、尿检"],["严重感染、血栓、糖尿病失控、急性神经症状"],"确认诊断与病因后再治疗，避免仅凭临床表现用药。"],
"犬糖尿病": ["犬",["糖尿病"],["血糖、尿检、果糖胺、酮体","评估感染和胰腺疾病"],["血糖曲线、体重、饮食、尿酮体"],["DKA、低血糖、脱水、呕吐"],"胰岛素、饮食与监测必须形成闭环。"],
"犬DKA": ["犬",["糖尿病酮症酸中毒"],["血气、电解质、葡萄糖、β羟丁酸/酮体","寻找诱因"],["K/P/Mg、血糖、酸碱、UOP、体重"],["严重高/低钾、酸血症、脑水肿风险、休克"],"按急诊流程处理；钾、胰岛素和液体必须动态调整。"],
"犬尿石症": ["犬",["尿石症","尿路结石"],["尿检、影像、尿培养按适应证","评估是否梗阻"],["排尿、尿量、肾指标、尿pH/晶体"],["尿闭、AKI、高钾、严重疼痛"],"明确结石类型后再谈溶石、饮食或手术。"],
"犬外耳炎": ["犬",["外耳炎"],["耳镜、耳道细胞学","评估马拉色菌/球菌/杆菌与耳螨"],["耳道细胞学、瘙痒、鼓膜状态"],["鼓膜不明、严重疼痛、前庭/神经症状"],"先清理和细胞学，再针对病原和基础过敏/内分泌疾病。"],
"犬脓皮症": ["犬",["表浅/深部脓皮症"],["皮肤细胞学、培养按复发/深部病例","寻找过敏、内分泌等基础病"],["皮损、瘙痒、细胞学、复发频率"],["深部感染、发热、败血症、快速扩散"],"尽量以局部治疗和病因控制为基础；系统抗菌应有明确适应证。"],
"犬中暑": ["犬",["热射病"],["核心体温、凝血、肾肝指标、电解质、乳酸","寻找DIC/AKI/低血糖"],["体温趋势、凝血、肾指标、尿量、乳酸"],["DIC、意识障碍、AKI、低血压"],"立即降温但避免过度；随后进行器官支持与并发症监测。"],
"犬GDV": ["犬",["胃扩张胃扭转"],["腹部影像、乳酸、ECG、电解质","快速减压与手术评估"],["灌注、乳酸、ECG、K/Ca、凝血"],["休克、心律失常、乳酸持续升高"],"外科急症；稳定与手术准备并行。"],
"败血症": ["犬/猫",["感染性休克","SIRS"],["感染源寻找、培养、CBC、生化、乳酸","器官功能评估"],["BP、乳酸、UOP、体温、血糖、器官指标"],["低血压、意识障碍、少尿、乳酸升高"],"感染控制与器官支持并行；抗菌方案依据感染源和药敏。"],
"贫血": ["犬/猫",["再生性/非再生性贫血"],["CBC+网织红细胞、血涂片","失血/溶血/骨髓抑制分型"],["PCV/Hb趋势、心率、灌注、出血"],["虚脱、低氧、活动性出血、休克"],"先判断是否危及生命，再确定输血与病因治疗。"],
"低血糖": ["犬/猫",["低血糖","胰岛素过量","幼龄动物","肝病"],["立即确认血糖并寻找原因","评估神经症状与电解质"],["血糖趋势、神经状态、进食、K/P"],["抽搐、意识障碍、持续低血糖"],"先纠正低血糖并防止反跳，再寻找病因。"],
"高钾血症": ["犬/猫",["高钾","尿闭","AKI","肾上腺功能减退"],["ECG、重复K、肾功能、酸碱","寻找排钾障碍"],["K趋势、ECG、UOP、酸碱"],["ECG异常、心动过缓、尿闭、严重无力"],"先判断心脏风险和病因；不要盲目补钾。"],
"低钾血症": ["犬/猫",["低钾","GI丢失","肾性丢失"],["重复K、Mg、酸碱、尿钾按需","寻找持续丢失原因"],["K、ECG、肌力、UOP"],["严重无力、颈屈、心律失常"],"补钾速度和浓度必须按体重、输液速度和实时K复查核算。"],
"低钙血症": ["犬/猫",["低钙","低白蛋白","低PTH","胰腺炎"],["离子钙优先、总钙+白蛋白、磷、Mg","评估ECG与神经肌肉症状"],["iCa、ECG、神经肌肉状态"],["抽搐、四肢僵硬、心律失常"],"确认离子钙后决定是否需要紧急处理。"],
"低钠血症": ["犬/猫",["低钠","低容量/正常容量/高容量"],["确认慢急性、容量状态、尿渗透压/电解质按场景","寻找内分泌、GI、肾脏原因"],["Na趋势、神经状态、容量状态"],["癫痫、意识障碍、严重低血压"],"纠正速度必须受控，避免快速校正造成神经并发症。"],
"高钠血症": ["犬/猫",["高钠","自由水缺失"],["评估脱水、尿浓缩能力和水摄入","寻找持续水丢失"],["Na趋势、体重、神经状态、尿量"],["严重神经症状、休克、快速变化"],"校正速度需结合急慢性和神经状态。"],
"胸腔积液": ["犬/猫",["胸水"],["胸部影像/POCUS、胸腔穿刺与液体分析","区分漏出液、渗出液、乳糜等"],["RR、SpO2、呼吸功、胸水量"],["呼吸衰竭、张力性气胸风险"],"呼吸受限时先解除压迫，再确定病因。"],
"腹腔积液": ["犬/猫",["腹水"],["腹部超声、腹水分析、蛋白/细胞学","按场景检查心肝肾和感染"],["呼吸、腹围、体重、血压"],["呼吸受限、腹膜炎、休克"],"液体性质和病因比单纯腹水量更重要。"],
"癫痫持续状态": ["犬/猫",["status epilepticus"],["血糖、电解质、体温、毒物史","评估原发性/结构性/代谢性原因"],["神经状态、体温、血糖、ECG/呼吸"],["持续抽搐、低氧、高热、意识不恢复"],"先控制持续抽搐并保障气道，再寻找病因。"],
"急性中毒": ["犬/猫",["药物/化学品/植物中毒"],["明确成分、时间、剂量","按毒物选择去污染/解毒/器官支持"],["生命体征、血糖、电解质、肝肾、ECG"],["意识障碍、呼吸困难、抽搐、休克"],"去污染不能延误ABC；具体解毒剂需核对毒理资料。"],
"创伤": ["犬/猫",["多发伤","钝挫伤","咬伤"],["ABCDE、FAST、胸腹影像","评估出血、气胸、骨折"],["灌注、乳酸、PCV/TS、尿量、疼痛"],["呼吸衰竭、内出血、休克、神经异常"],"先处理致命问题，再进行完整损伤评估。"],
"术后恢复": ["犬/猫",["术后监护"],["疼痛、体温、循环、呼吸、出血、尿量","根据手术类型设定专项监测"],["疼痛评分、RR、BP、体温、进食、伤口"],["持续低血压、低体温、呼吸异常、出血、疼痛失控"],"术后监测应有时间点和升级阈值。"],
"化疗患者": ["犬/猫",["肿瘤化疗支持"],["CBC、生化、分期、感染风险","按药物建立特异毒性监测"],["CBC、肝肾、胃肠道、体重"],["发热性中性粒细胞减少、严重呕吐腹泻、器官毒性"],"化疗剂量必须以具体药物方案和肿瘤科 protocol 为准。"],
"肥胖": ["犬/猫",["超重/肥胖"],["BCS/MCS、饮食史、内分泌病筛查按场景","制定能量目标"],["体重、BCS、腰围/体脂趋势"],["快速减重、肌肉流失"],"减重目标应以长期趋势为核心，避免激进限食。"],
"慢性腹泻": ["犬/猫",["慢性肠病","IBD","寄生虫","食物反应"],["粪检、饮食试验、CBC/生化、TLI/B12/叶酸按场景","影像/内镜按需要"],["体重、粪便评分、白蛋白、B12"],["低蛋白、消瘦、血便、严重脱水"],"先排除感染/寄生虫和系统性疾病，再进行饮食和分层诊断。"],
"慢性咳嗽": ["犬/猫",["气道疾病","心源性","肺部疾病"],["胸片、心超按场景、气道评估","年龄/品种风险整合"],["RR、睡眠呼吸频率、SpO2、影像趋势"],["呼吸困难、紫绀、晕厥"],"先区分心源性、气道和肺实质疾病。"],
"皮肤瘙痒": ["犬/猫",["过敏性皮炎","寄生虫","感染"],["跳蚤梳、皮肤细胞学、皮肤刮片","排除感染后再评估过敏"],["瘙痒评分、细胞学、体重、皮损"],["深部感染、快速扩散、全身症状"],"先做基础皮肤学检查，避免在未排除感染/寄生虫时直接长期免疫抑制。"],
"眼红": ["犬/猫",["结膜炎","角膜溃疡","青光眼","葡萄膜炎"],["荧光素、眼压、裂隙灯/眼底按条件","角膜溃疡必须优先排除"],["眼压、角膜、疼痛、瞳孔反应"],["角膜混浊、眼压异常、严重疼痛、视力下降"],"眼科红旗优先于经验性滴药。"],
"跛行": ["犬/猫",["骨科","软组织","神经"],["步态、触诊、关节活动度、影像","必要时镇静下完整检查"],["疼痛评分、负重、关节肿胀、影像"],["不负重、开放性损伤、神经缺损、严重疼痛"],"先定位解剖部位，再决定影像与治疗。"],
"贫血性出血": ["犬/猫",["急性失血"],["PCV/TS趋势、凝血、血型/交叉配血按需","寻找出血源"],["PCV、BP、HR、乳酸、出血量"],["休克、持续活动性出血、意识障碍"],"控制出血和循环支持优先；输血决策看临床状态与趋势。"],
"心源性肺水肿": ["犬/猫",["CHF肺水肿"],["POCUS/胸片、心超按需、血压","排除非心源性原因"],["RR、SpO2、BP、肾功能、电解质、体重"],["严重呼吸困难、低氧、低血压"],"氧合与减轻肺水肿并行；利尿强度需根据容量、肾功能和血压动态调整。"],
"败血性腹膜炎": ["犬/猫",["腹膜炎","感染性休克"],["腹腔液分析/培养、影像","外科源控制评估"],["BP、乳酸、CBC、生化、UOP、体温"],["休克、乳酸升高、肠穿孔/胆汁腹膜炎"],"源控制与抗感染支持必须并行。"],
"猫FIP": ["猫",["FIP","猫传染性腹膜炎"],["结合临床、影像、体液分析、PCR/抗体等证据综合判断","避免单一PCR作为唯一诊断依据"],["体重、体温、CBC/生化、胆红素、眼/神经表现"],["呼吸困难、神经症状、严重贫血、进行性恶化"],"抗病毒方案需结合当前法规、可获得制剂和权威指南核对；诊断不能仅靠单项PCR。"]
};
// Ensure broad searchable coverage: additional aliases/categories for common workflows.
const common=["犬慢性胃肠病","猫慢性胃肠病","犬肝病","猫肝病","犬胆囊黏液囊肿","猫胆道梗阻","犬胰外分泌不足","猫胰外分泌不足","犬贫血","猫贫血","犬血栓风险","猫血栓风险","犬低蛋白血症","猫低蛋白血症","犬蛋白丢失性肠病","猫蛋白丢失性肠病","犬蛋白丢失性肾病","猫蛋白丢失性肾病","犬高血压","猫高血压","犬心律失常","猫心律失常","犬尿路感染","猫尿路感染","犬肾盂肾炎","猫肾盂肾炎","犬乳腺肿瘤","猫乳腺肿瘤","犬淋巴瘤","猫淋巴瘤","犬肥大细胞瘤","猫淋巴瘤化疗","犬骨关节炎","猫骨关节炎","犬椎间盘疾病","猫神经疾病","犬耳血肿","猫耳病","犬结膜炎","猫结膜炎","犬角膜溃疡","猫角膜溃疡","犬青光眼","猫青光眼","犬葡萄膜炎","猫葡萄膜炎","犬寄生虫性肠炎","猫寄生虫性肠炎","犬钩虫感染","猫蛔虫感染","犬心丝虫病","猫心丝虫病","犬蜱媒病","猫蜱媒病","犬真菌性皮肤病","猫皮癣菌病","犬念珠菌感染","猫念珠菌感染","犬中毒","猫中毒"];
common.forEach(k=>{if(!protocols[k])protocols[k]=[k.startsWith("猫")?"猫":k.startsWith("犬")?"犬":"犬/猫",[k],["结合病史、体检、最小数据库与针对性检查建立鉴别诊断","按病情选择影像/细胞学/培养/专项检测"],["生命体征、体重、主要器官指标、治疗反应"],["呼吸困难、休克、意识障碍、少尿/无尿、持续无法进食"],"结构化临床框架；具体药物和剂量必须核对当前制剂标签与权威指南。"]});

function calcBSA(){const w=n("cwBsaW");if(!w||w<=0)return out("cwBsaOut","<div class='bad'>请输入有效体重。</div>");const bsa=0.1*Math.pow(w,2/3);out("cwBsaOut",`<div class='result'>BSA ≈ <b>${bsa.toFixed(3)} m²</b>（公式：0.1×kg<sup>2/3</sup>）。仅作数学换算；化疗等方案必须使用对应 protocol 的体表面积/剂量规则。</div>`)}
function calcUop(){const w=n("cwUopW"),ml=n("cwUopMl"),h=n("cwUopH")||1;if(!w||ml===null)return out("cwUopOut","<div class='bad'>请输入体重、尿量和时间。</div>");const rate=ml/w/h;out("cwUopOut",`<div class='result'>UOP ≈ <b>${rate.toFixed(2)} mL/kg/h</b>。结合容量状态、利尿剂使用、肾功能和趋势解释。</div>`)}
function calcK(){const w=n("cwKBagW"),rate=n("cwKRate"),bag=n("cwKBagVol"),stock=n("cwKStock"),target=n("cwKTarget");if(!w||!rate||!bag||!stock||target===null)return out("cwKOut","<div class='bad'>请输入完整参数。</div>");const max=0.5;const maxStock=rate*max*w;const add=stock>0?maxStock*bag/rate/stock:null;out("cwKOut",`<div class='result'>按 <b>${max} mEq/kg/h</b> 作为安全上限检查：当前输液速率 ${rate} mL/h 时，理论K输入上限约 <b>${maxStock.toFixed(2)} mEq/h</b>。若原液为 ${stock} mEq/mL，则每 ${bag} mL 液体对应的最大数学加入量约 <b>${add?.toFixed(2)||"—"} mL</b>。</div><div class='warn'>这是安全上限核算，不是处方。必须结合当前血钾、ECG、肾功能、尿量、实际制剂浓度及医院protocol；高钾或无尿患者不得套用。</div>`)}
function calcFluidPlan(){const w=n("cwFw"),de=n("cwDeh")||0,loss=n("cwLoss")||0,h=n("cwHours")||24; if(!w||w<=0)return out("cwFluidOut","<div class='bad'>请输入体重。</div>");const deficit=w*de*10,total=deficit+loss;out("cwFluidOut",`<div class='result'><b>脱水缺失：</b>${deficit.toFixed(0)} mL<br><b>已计入持续丢失：</b>${loss.toFixed(0)} mL<br><b>${h} h数学平均速率：</b>${(total/h).toFixed(1)} mL/h</div><div class='warn'>实际计划还必须加入维持量，并按心肾功能、灌注、尿量、持续丢失和动态体重调整；不要把数学平均速率直接作为固定输液处方。</div>`)}
function calcTrans(){const w=n("cwTrW"),pcv=n("cwTrPcv"),tar=n("cwTrTar"),prod=n("cwTrProd");if(!w||pcv===null||tar===null||!prod)return out("cwTrOut","<div class='bad'>请输入完整参数。</div>");const v=Math.max(0,w*0.08*((tar-pcv)/prod)*1000);out("cwTrOut",`<div class='result'>按简化HCT容量公式估算产品量约 <b>${v.toFixed(0)} mL</b>。实际应结合持续失血、临床症状、血型/交叉配血和血制品HCT。</div>`)}
function interpretLabs(){const wbc=n("cwWbc"),neu=n("cwNeu"),alt=n("cwAlt"),alp=n("cwAlp"),tb=n("cwTb"),alb=n("cwAlb"),cr=n("cwCr"),k=n("cwK");const a=[];if(wbc!==null&&wbc>20)a.push("白细胞增多");if(neu!==null&&neu>15)a.push("中性粒细胞增多");if(alt!==null&&alt>150)a.push("ALT升高");if(alp!==null&&alp>200)a.push("ALP升高");if(tb!==null&&tb>20)a.push("胆红素升高");if(alb!==null&&alb<2.5)a.push("低白蛋白");if(cr!==null&&cr>2)a.push("肌酐升高");if(k!==null&&k>5.5)a.push("高钾红旗");let pattern=[];if((alt!==null&&alt>150)&&(tb!==null&&tb>20))pattern.push("肝胆异常/胆汁淤积模式需进一步分型");if((wbc!==null&&wbc>20)&&(neu!==null&&neu>15))pattern.push("炎症/应激模式，需结合左移、毒性改变和感染源");if((alb!==null&&alb<2.5))pattern.push("低蛋白血症：区分生成减少、丢失和稀释");if((cr!==null&&cr>2)&&(k!==null&&k>5.5))pattern.push("肾排钾障碍/尿路梗阻等需优先排除");out("cwLabOut",`<div class='result'><b>输入异常：</b>${a.length?a.join("、"):"未触发本工具的简化阈值"}</div>${pattern.map(x=>`<div class='info'>${esc(x)}</div>`).join("")}<div class='warn'>阈值仅为模式筛查示例，不替代本院参考区间；必须结合物种、年龄、仪器、临床状态和趋势。</div>`)}
function interactionAudit(){const q=(($('cwDrugA')?.value||"")+" "+($('cwDrugB')?.value||"")+" "+($('cwDrugC')?.value||"")).toLowerCase();const hits=[];if(q.includes("美洛昔康")&&q.includes("泼尼松"))hits.push("NSAID + 糖皮质激素：胃肠道/肾脏风险需要重点复核");if(q.includes("美洛昔康")&&q.includes("阿米卡星"))hits.push("NSAID + 氨基糖苷类：肾毒性风险需重点监测");if((q.includes("氯吡格雷")||q.includes("利伐沙班")||q.includes("肝素"))&&q.includes("出血"))hits.push("抗血栓治疗叠加出血风险：需复核适应证与凝血/出血状态");if(q.includes("ace")||q.includes("依那普利")||q.includes("贝那普利"))if(q.includes("钾")||q.includes("螺内酯"))hits.push("RAAS抑制 + 保钾/高钾风险：复核K与肾功能");out("cwIntOut",hits.length?hits.map(x=>`<div class='bad'>⚠️ ${esc(x)}</div>`).join(""):"<div class='result'>当前简化规则未识别已知高风险组合。仍需核对具体药品说明书、剂量、疗程和患者因素。</div>")}
function renderProtocolList(){const q=($('cwProtoQ')?.value||"").toLowerCase().trim();const sp=$('cwProtoSp')?.value||"";const arr=Object.entries(protocols).filter(([k,v])=>(!q||[k,...v[1],...(v[2]||[])].join(" ").toLowerCase().includes(q))&&(!sp||v[0].includes(sp))).slice(0,60);out("cwProtoOut",arr.map(([k,v])=>`<article class='protocol-card'><div class='label-head'><div><div class='label-title'>${esc(k)}</div><div class='muted'>${esc(v[0])}</div></div><span class='pill'>临床框架</span></div>${v[1].map(x=>`<span class='pill'>${esc(x)}</span>`).join("")}<div class='label-sec'><h4>优先评估</h4><ul class='label-list'>${v[2].map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div><div class='label-sec'><h4>监测</h4><ul class='label-list'>${v[3].map(x=>`<li>${esc(x)}</li>`).join("")}</ul></div><div class='redflag'><b>红旗：</b>${esc(v[4].join("、"))}</div><div class='label-note'>${esc(v[5])}</div></article>`).join("")||"<div class='muted'>无匹配。</div>")}
function makeReport(){const species=$('cwRSpecies').value,w=n("cwRW"),chief=$('cwRChief').value,abn=$('cwRAbn').value,ddx=$('cwRDDx').value,plan=$('cwRPlan').value,monitor=$('cwRMon').value;const text=`兽医临床结构化记录\n物种：${species}\n体重：${w||"未记录"} kg\n主诉：${chief}\n主要异常：${abn}\n鉴别诊断：${ddx}\n治疗/处理计划：${plan}\n监测与复查：${monitor}\n\n安全提示：本记录为临床辅助模板，具体处方、剂量及诊疗结论由执业兽医复核。`;out("cwReportOut",`<pre class='result' style='white-space:pre-wrap;font:inherit'>${esc(text)}</pre><button class='secondary' id='cwCopyReport'>复制文本</button>`);$('cwCopyReport').onclick=()=>navigator.clipboard?.writeText(text)}
function timeline(){const key="vct50_timeline",arr=JSON.parse(localStorage.getItem(key)||"[]");const date=new Date().toLocaleString();const item={date,event:$('cwTEvent').value,note:$('cwTNote').value};if(item.event||item.note){arr.push(item);localStorage.setItem(key,JSON.stringify(arr.slice(-100)))}out("cwTimelineOut",(JSON.parse(localStorage.getItem(key)||"[]")).reverse().map(x=>`<div class='label-row'><b>${esc(x.date)}</b> · ${esc(x.event)}<br>${esc(x.note)}</div>`).join("")||"<div class='muted'>暂无时间轴。</div>")}
function wire(){
  ["cwBsaBtn","cwUopBtn","cwKBtn","cwFluidBtn","cwTrBtn","cwLabBtn","cwIntBtn","cwProtoBtn","cwReportBtn","cwTimelineBtn"].forEach(id=>$(id)?.addEventListener("click",{cwBsaBtn:calcBSA,cwUopBtn:calcUop,cwKBtn:calcK,cwFluidBtn:calcFluidPlan,cwTrBtn:calcTrans,cwLabBtn:interpretLabs,cwIntBtn:interactionAudit,cwProtoBtn:renderProtocolList,cwReportBtn:makeReport,cwTimelineBtn:timeline}[id]));
  $('cwProtoQ')?.addEventListener('input',renderProtocolList);$('cwProtoSp')?.addEventListener('change',renderProtocolList);renderProtocolList();timeline();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
window.VCT50_WORKSTATION={protocols};
})();
