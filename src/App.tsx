import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import { ScenarioIllustration } from './components/ScenarioIllustration';

interface ScenarioOption {
  id: string;
  text: { en: string; ar: string };
  correct: boolean;
}

interface ScenarioData {
  id: string;
  zoneId: string;
  zoneName: { en: string; ar: string };
  title: { en: string; ar: string };
  department: { en: string; ar: string };
  description: { en: string; ar: string };
  environment: {
    heat: { en: string; ar: string; status: 'normal' | 'warm' | 'danger' };
    smoke: { en: string; ar: string; status: 'none' | 'light' | 'heavy' };
    people: { en: string; ar: string };
    urgency: { en: string; ar: string };
  };
  options: ScenarioOption[];
  actionSteps: {
    step1: { title: { en: string; ar: string }; text: { en: string; ar: string } };
    step2: { title: { en: string; ar: string }; text: { en: string; ar: string } };
    step3: { title: { en: string; ar: string }; text: { en: string; ar: string } };
  };
  explanation: { en: string; ar: string };
}

const ZONES_LIST = [
  { id: "zone1", code: "Zone 1", name: { en: "Open Office & Desks", ar: "المكاتب المفتوحة ومحطات العمل" }, icon: "🏢" },
  { id: "zone2", code: "Zone 2", name: { en: "Prayer Room & Restrooms", ar: "المصلى ودورات المياه" }, icon: "🚪" },
  { id: "zone3", code: "Zone 3", name: { en: "Medical Aid & Emergencies", ar: "الإسعافات الطبية والطوارئ" }, icon: "🩺" },
  { id: "zone4", code: "Zone 4", name: { en: "Accessibility & Special Care", ar: "دعم ذوي الإعاقة وكبار السن" }, icon: "♿" },
  { id: "zone5", code: "Zone 5", name: { en: "Exit Doors & Fire Safety", ar: "أبواب الخروج والسلامة من الحريق" }, icon: "🔥" }
];

// 9 SCENARIOS WITH BALANCED EQUAL-LENGTH OPTIONS (~26-30 words each) AND ZERO GIVEAWAYS
const SCENARIOS: ScenarioData[] = [
  {
    id: "1A",
    zoneId: "zone1",
    zoneName: { en: "Zone 1: Open Office & Desks", ar: "المنطقة 1: المكاتب المفتوحة ومحطات العمل" },
    title: { en: "Colleague Frozen in Panic at Desk", ar: "زميل متجمد في مكانه بسبب الخوف" },
    department: { en: "Administration & Finance Office", ar: "مكتب الإدارة والمالية" },
    description: {
      en: "While checking the open office as the alarm sounds, you see a colleague sitting motionless at their desk. Their hands are gripping the table, staring in shock, unable to stand up on their own.",
      ar: "أثناء تفقد المكاتب مع انطلاق جرس الإنذار، لاحظت زميلاً جالساً بلا حراك عند مكتبه، يمسك حافة الطاولة وينظر بذهول، غير قادر على الوقوف بمفرده."
    },
    environment: {
      heat: { en: "Normal", ar: "عادية", status: "normal" },
      smoke: { en: "Light Ceiling Smoke", ar: "دخان خفيف بالسقف", status: "light" },
      people: { en: "1 Colleague in Shock", ar: "موظف واحد في حالة صدمة" },
      urgency: { en: "Needs Immediate Help", ar: "يتطلب مساعدة فورية" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Call out firmly from the office doorway, mark their cubicle number on your sweep roster, and assume they will join the line once they see colleagues vacating the area.",
          ar: "النداء عليه بحزم من عند باب المكتب، وتدوين رقم مكتبه في قائمة المسح، والافتراض بأنه سينضم للطابور بمجرد رؤية بقية الزملاء يخلون المكان."
        },
        correct: false
      },
      {
        id: "B",
        text: {
          en: "Approach their desk directly, place a firm reassuring hand on their shoulder, give clear direct verbal instructions, and escort them together with the moving evacuation line.",
          ar: "التوجه لمكتبه مباشرة، ووضع يد ثابتة ومطمئنة على كتفه، وتوجيه تعليمات لفظية واضحة ومباشرة، ومرافقته للخروج معاً ضمن طابور الإخلاء المتحرك."
        },
        correct: true
      },
      {
        id: "C",
        text: {
          en: "Sit beside them at their desk, speak in a gentle quiet voice to reduce their heart rate, and wait until they regain full voluntary movement before attempting evacuation.",
          ar: "الجلوس بجانبه عند مكتبه، والتحدث بنبرة هادئة لتخفيض نبضات قلبه، والانتظار حتى يستعيد التحكم الكامل بحركته الإرادية قبل محاولة بدء الخروج."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Spot Panic Shock", ar: "الخطوة 1: ملاحظة الصدمة والهلع" },
        text: { en: "Recognize that a frozen colleague is in shock and cannot stand up or evacuate on their own.", ar: "الانتباه إلى أن الزميل يمر بحالة تجمد نفسي ولا يستطيع التحرك بمفرده." }
      },
      step2: {
        title: { en: "Step 2: Touch Shoulder & Speak Calmly", ar: "الخطوة 2: لمس الكتف والحديث بحزم" },
        text: { en: "Place a reassuring hand on their shoulder and give a clear, firm instruction: 'Look at me, let's stand up now.'", ar: "وضع يدك على كتفه وتوجيه أمر بسيط ومباشر: 'انظر إليّ، دعنا نقف الآن ونخرج معاً'." }
      },
      step3: {
        title: { en: "Step 3: Walk Out Together", ar: "الخطوة 3: المرافقة حتى المخرج" },
        text: { en: "Hold their arm and keep them in the evacuation line until you are both safely outside.", ar: "الإمساك بذراعه والمشي معه بجانب الفريق حتى الوصول بأمان لنقطة التجمع." }
      }
    },
    explanation: {
      en: "People in panic freeze need a direct, gentle physical touch and clear verbal guidance to snap out of shock. Never leave them behind and never waste time sitting to wait during an active alarm.",
      ar: "الشخص المتجمد من الخوف يحتاج إلى لمسة يد واضحة وحديث حازم لإخراجه من الصدمة. لا تتركه بمفرده ولا تضيع وقتاً في الجلوس والانتظار أثناء الإنذار."
    }
  },
  {
    id: "1B",
    zoneId: "zone1",
    zoneName: { en: "Zone 1: Open Office & Desks", ar: "المنطقة 1: المكاتب المفتوحة ومحطات العمل" },
    title: { en: "Foreign Visitor Who Doesn't Speak English or Arabic", ar: "زائر أجنبي لا يتحدث العربية أو الإنجليزية" },
    department: { en: "Procurement & Contracts Wing", ar: "قسم المشتريات والعقود" },
    description: {
      en: "In a meeting room, you meet an international visitor holding laptop bags. They hear the emergency sirens and loudspeaker messages, but look completely confused, pointing at their heavy luggage and wondering what to do.",
      ar: "أثناء تفقد غرف الاجتماعات، قابلت زائراً أجنبياً يحمل حقائب لابتوب. يسمع صفارات الإنذار والإعلانات الصوتية لكنه يبدو محتاراً تماماً، ويشير إلى حقائبه الثقيلة متسائلاً ماذا يفعل."
    },
    environment: {
      heat: { en: "Normal", ar: "معتدل", status: "normal" },
      smoke: { en: "None in Room", ar: "لا يوجد دخان", status: "none" },
      people: { en: "1 Confused Visitor", ar: "زائر واحد محتار" },
      urgency: { en: "Quick Guidance Needed", ar: "إرشاد سريع لتفادي التأخير" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Direct the visitor into an empty adjacent conference room, close the door to keep them safe, and search the floor for a multilingual staff member who can translate instructions.",
          ar: "توجيه الزائر لغرفة اجتماعات مجاورة فارغة، وإغلاق الباب لإبقائه بأمان، والبحث في الدور عن موظف متعدد اللغات لترجمة تعليمات الطوارئ."
        },
        correct: false
      },
      {
        id: "B",
        text: {
          en: "Use clear directional hand signals pointing toward the exit stairs, gently steer them away from their luggage, and position them safely in the center of your evacuation group.",
          ar: "استخدام إشارات حركية واضحة تشير إلى سلم الخروج، وتوجيهه بلطف للابتعاد عن حقائبه، ووضعه بأمان في منتصف مجموعة الإخلاء الخاصة بك."
        },
        correct: true
      },
      {
        id: "C",
        text: {
          en: "Hand them a printed building evacuation map from the reception desk, point directly toward the emergency stairwell, and instruct them to follow the illuminated exit signs independently.",
          ar: "تسليمه خريطة إخلاء مطبوعة من مكتب الاستقبال، والإشارة مباشرة باتجاه سلم الطوارئ، وتوجيهه لاتباع لوحات الخروج المضيئة بمفرده."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Spot the Language Barrier", ar: "الخطوة 1: معرفة حاجز اللغة" },
        text: { en: "Understand that the visitor cannot follow loudspeaker voice messages and doesn't know the building.", ar: "إدراك أن الزائر لا يفهم الإعلانات الصوتية ولا يعرف مخارج المبنى." }
      },
      step2: {
        title: { en: "Step 2: Simple Hand Gestures", ar: "الخطوة 2: إشارات يد واضحة" },
        text: { en: "Wave toward the exit door and encourage them to leave heavy luggage behind immediately.", ar: "الإشارة بيدك باتجاه المخرج والتأكيد بلطف على ترك الحقائب الثقيلة." }
      },
      step3: {
        title: { en: "Step 3: Keep Them in the Group", ar: "الخطوة 3: ضمه للمجموعة" },
        text: { en: "Walk them in the center of your group so they don't wander off or turn back into danger.", ar: "وضعه وسط الزملاء في طابور الخروج حتى لا يتشتت أو يعود إلى مناطق الخطر." }
      }
    },
    explanation: {
      en: "During alarms, hand signals and direct guidance overcome language barriers instantly. Never leave visitors inside rooms or expect them to navigate alone.",
      ar: "إشارات اليد الواضحة والمرافقة المباشرة تحل حاجز اللغة فوراً أثناء الطوارئ. لا تترك الزوار داخل الغرف ولا تتوقع منهم معرفة مخارج الطوارئ بمفردهم."
    }
  },
  {
    id: "2A",
    zoneId: "zone2",
    zoneName: { en: "Zone 2: Prayer Room & Restrooms", ar: "المنطقة 2: المصلى ودورات المياه" },
    title: { en: "Colleagues in Prayer During Fire Alarm", ar: "زملاء يؤدون الصلاة أثناء انطلاق الإنذار" },
    department: { en: "2nd Floor Administration Prayer Room", ar: "مصلى الدور الثاني" },
    description: {
      en: "Opening the prayer room door, you find five colleagues in the middle of prayer. The room door was shut so the alarm was muffled inside, but smoke is starting to enter through the air vents from the hallway.",
      ar: "عند فتح باب المصلى، وجدت خمسة زملاء يؤدون الصلاة جماعة. كان الباب مغلقاً وصوت الإنذار منخفضاً بالداخل، لكن الدخان بدأ يدخل عبر فتحات التكييف."
    },
    environment: {
      heat: { en: "Slightly Warm", ar: "دافئ قليلاً", status: "warm" },
      smoke: { en: "Smoke from Vents", ar: "دخان من التكييف", status: "light" },
      people: { en: "5 Colleagues Praying", ar: "5 زملاء يؤدون الصلاة" },
      urgency: { en: "Life Safety First", ar: "سلامة الأرواح أولاً" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Stand patiently near the open doorway, observe the ongoing congregational prayer, and wait until the worshippers complete their final salutation before informing them of the building evacuation alarm.",
          ar: "الوقوف بهدوء قرب المدخل المفتوح، ومراقبة صلاة الجماعة الجارية، والانتظار حتى يكمل المصلون تسليمهم النهائي قبل إبلاغهم بإنذار الإخلاء العام."
        },
        correct: false
      },
      {
        id: "B",
        text: {
          en: "Enter the hall immediately, announce firmly that life safety requires instant evacuation, ensure all worshippers exit, inspect the corner shoe racks, and shut the door upon leaving.",
          ar: "الدخول فوراً للمصلى، والإعلان بحزم أن حماية الحياة تقتضي الإخلاء الفوري، والتأكد من خروج الجميع، وتفقد زاوية الأحذية، وإغلاق الباب عند المغادرة."
        },
        correct: true
      },
      {
        id: "C",
        text: {
          en: "Press the emergency door release button at the entrance, prop the heavy prayer room door open with a doorstop, and proceed along the corridor to alert remaining staff.",
          ar: "الضغط على زر فتح الطوارئ عند المدخل، وتثبيت باب المصلى مفتوحاً بمصد خشبي، ومواصلة التحرك على طول الممر لتنبيه بقية الموظفين."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Life Safety Comes First", ar: "الخطوة 1: حفظ النفس أولاً" },
        text: { en: "Remember that human life and safety always take priority over finishing any ongoing activity or prayer.", ar: "تذكر دائماً أن حفظ النفس وسلامة الأرواح مقدمة على إكمال أي نشاط بما في ذلك الصلاة." }
      },
      step2: {
        title: { en: "Step 2: Clear Loud Order", ar: "الخطوة 2: تنبيه صوتي حازم" },
        text: { en: "Speak firmly and clearly so everyone stops and moves toward the door without hesitation.", ar: "التحدث بنبرة قوية وواضحة ليسمعك الجميع ويتجهوا نحو المخرج فوراً دون تردد." }
      },
      step3: {
        title: { en: "Step 3: Check Corners & Shut Door", ar: "الخطوة 3: تفقد الزوايا وإغلاق الباب" },
        text: { en: "Quickly scan shoe racks and wash corners to ensure zero occupants remain, then close the door to keep smoke out.", ar: "التأكد السريع من خلو أماكن الوضوء والأحذية ثم إغلاق الباب بإحكام لعزل الدخان." }
      }
    },
    explanation: {
      en: "Protecting human lives is the highest priority. A loud, clear announcement stops prayer safely, and closing the door behind everyone slows down smoke and fire spread.",
      ar: "حماية الأرواح هي الأولوية القصوى دائماً. النداء الواضح يضمن إخلاء المصلى بأمان، وإغلاق الباب يمنع انتشار الدخان إلى بقية المبنى."
    }
  },
  {
    id: "2B",
    zoneId: "zone2",
    zoneName: { en: "Zone 2: Prayer Room & Restrooms", ar: "المنطقة 2: المصلى ودورات المياه" },
    title: { en: "Locked Restroom Stall with Smoke Coming In", ar: "كابينة حمام مغلقة مع دخول الدخان" },
    department: { en: "Main Office Restrooms", ar: "دورات المياه الرئيسية" },
    description: {
      en: "Inside the restrooms, grey smoke is drifting in from the ceiling. All stall doors are open except one locked corner stall. Nobody answers when you call out normally.",
      ar: "داخل دورات المياه، بدأ دخان رمادي يدخل من فتحات السقف. جميع الأبواب مفتوحة باستثناء كابينة واحدة مغلقة بالزاوية، ولا أحد يجيب عند النداء العادي."
    },
    environment: {
      heat: { en: "Getting Hot", ar: "حرارة متزايدة", status: "warm" },
      smoke: { en: "Grey Smoke Entering", ar: "دخان رمادي متصاعد", status: "heavy" },
      people: { en: "Potential Person Inside", ar: "احتمال وجود شخص بالداخل" },
      urgency: { en: "Urgent Check Required", ar: "فحص عاجل" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Bang heavily on the stall door, shout the official emergency announcement, inspect under the gap for feet, and if smoke worsens, mark the room and report outside.",
          ar: "الطق بقوة على باب الكابينة، وإطلاق نداء الطوارئ المعتمد، وتفقد أسفل الفتحة لرؤية أي أقدام، وإذا زاد الدخان، تسجيل المكان والإبلاغ بالخارج."
        },
        correct: true
      },
      {
        id: "B",
        text: {
          en: "Attempt to force the stall lock open with your shoulder, prioritizing an immediate breach of the door regardless of the thickening smoke layer accumulating near the bathroom ceiling.",
          ar: "محاولة كسر قفل الكابينة بكتفك، مع إعطاء الأولوية لاقتحام الباب فوراً بغض النظر عن تزايد طبقة الدخان الكثيفة المتراكمة قرب سقف الحمام."
        },
        correct: false
      },
      {
        id: "C",
        text: {
          en: "Assume the door mechanism engaged accidentally from the inside, shut the outer restroom entrance door tightly, and continue sweeping the remaining offices to maintain evacuation speed.",
          ar: "الافتراض بأن مزلاج الباب قد انغلق بالخطأ من الداخل، وإغلاق باب الحمام الخارجي بإحكام، ومواصلة مسح بقية المكاتب للحفاظ على سرعة الإخلاء."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Check Locked Stalls", ar: "الخطوة 1: التحقق من الأبواب المغلقة" },
        text: { en: "Never walk past a locked door without verifying if someone is inside or unable to respond.", ar: "عدم تجاهل أي كابينة مغلقة دون التأكد هل يوجد بداخلها شخص بحاجة لمساعدة." }
      },
      step2: {
        title: { en: "Step 2: Knock, Shout & Check Gap", ar: "الخطوة 2: طرق الباب والصراخ والنظر بالأسفل" },
        text: { en: "Bang loudly on the door, shout the evacuation order, and bend down to look for feet under the gap.", ar: "الطق بقوة، والصراخ بأمر الإخلاء، والنظر أسفل الباب للتأكد من وجود أقدام أو شخص ساقط." }
      },
      step3: {
        title: { en: "Step 3: Escalate to Fire Team", ar: "الخطوة 3: الإبلاغ السريع لفريق الإنقاذ" },
        text: { en: "If heavy smoke threatens your own breathing, exit immediately and give the exact stall location to firefighters outside.", ar: "إذا هدد الدخان سلامتك، اخرج فوراً وأبلغ رجال الإطفاء المجهزين بالأقنعة بالموقع الدقيق." }
      }
    },
    explanation: {
      en: "The bang-and-shout protocol quickly verifies if someone is inside without risking your own life. If smoke makes staying dangerous, evacuate and direct equipped firefighters to that exact stall.",
      ar: "بروتوكول الطرق والصراخ يكشف وجود أشخاص دون المخاطرة بحياتك. إذا زادت كثافة الدخان، اخرج فوراً وأرشد فرق الإطفاء المجهزة للموقع الدقيق."
    }
  },
  {
    id: "3A",
    zoneId: "zone3",
    zoneName: { en: "Zone 3: Medical Aid & Emergencies", ar: "المنطقة 3: الإسعافات الطبية والطوارئ" },
    title: { en: "Colleague Collapsed in Clean, Smoke-Free Hallway", ar: "زميل سقط فاقداً للوعي في ممر نظيف وخالٍ من الدخان" },
    department: { en: "Main Hallway near First Aid Station", ar: "الممر الرئيسي بجانب نقطة الإسعافات" },
    description: {
      en: "Heading to the stairs, a colleague suddenly collapses onto the floor 10 meters ahead. The hallway air is completely clean, and right on the wall beside them is an Automated External Defibrillator (AED) medical box.",
      ar: "أثناء التوجه للدرج، سقط زميل فجأة على بعد 10 أمتار أمامك. هواء الممر نظيف تماماً وخالٍ من الدخان، وبجانبه مباشرة جهاز الصدمات الكهربائية للقلب (AED)."
    },
    environment: {
      heat: { en: "Normal", ar: "طبيعية", status: "normal" },
      smoke: { en: "Clean Air / None", ar: "هواء نقي تماماً", status: "none" },
      people: { en: "1 Collapsed Person", ar: "مصاب فاقد للوعي" },
      urgency: { en: "3 Minutes Survival Window", ar: "نافذة إنقاذ 3 دقائق" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Verify immediate area safety, check for breathing, commence chest compressions, open and attach the nearby AED unit, and instruct a passing colleague to call for emergency medical responders.",
          ar: "التحقق من سلامة المحيط المباشر، وفحص التنفس، وبدء الضغطات الصدرية، وفتح وتوصيل جهاز AED المجاور، وتكليف زميل مار بالاتصال بالمسعفين."
        },
        correct: true
      },
      {
        id: "B",
        text: {
          en: "Perform an emergency two-person drag down the stairwell flights to reach the exterior apron, postponing chest compressions and AED use until the patient is completely outside the building.",
          ar: "تنفيذ سحب اضطراري للمصاب بواسطة شخصين عبر أدوار الدرج للوصول للساحة الخارجية، مع تأجيل الضغطات وجهاز AED حتى خروجه تماماً من المبنى."
        },
        correct: false
      },
      {
        id: "C",
        text: {
          en: "Position the colleague into the recovery position, cover them with an office thermal blanket, and continue your designated sweep corridor to avoid slowing down other evacuating staff.",
          ar: "وضع الزميل في وضعية الإفاقة الجانبية، وتغطيته ببطانية حرارية مكتبية، ومواصلة مسار تفقد المكاتب المحدد لك لتفادي تعطيل بقية الموظفين المغادرين."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Check Air Safety", ar: "الخطوة 1: التأكد من أمان الهواء" },
        text: { en: "If the air is clean and free of smoke, you can safely deliver immediate medical help right there.", ar: "إذا كان الهواء نظيفاً وخالياً من الدخان، فالمكان آمن لتقديم الإسعافات الفورية في نفس الموقع." }
      },
      step2: {
        title: { en: "Step 2: Immediate CPR & AED", ar: "الخطوة 2: الإنعاش واستخدام جهاز AED" },
        text: { en: "Start chest compressions and follow the automated voice prompts of the AED within the first 3 critical minutes.", ar: "البدء بالضغطات الصدرية واتباع التعليمات الصوتية لجهاز AED خلال أول 3 دقائق لإنقاذ القلب." }
      },
      step3: {
        title: { en: "Step 3: Call Medical Responders", ar: "الخطوة 3: طلب المسعفين وتوجيههم" },
        text: { en: "Direct a passing colleague to notify the emergency ambulance team outside with your exact hallway location.", ar: "توجيه زميل آخر لإبلاغ فريق الإسعاف بالخارج بموقعكم الدقيق في الممر لسرعة الوصول." }
      }
    },
    explanation: {
      en: "In a smoke-free hallway, sudden collapse and cardiac arrest require immediate CPR and AED defibrillation within 3 minutes. Never drag a collapsed person down stairs without checking their breathing.",
      ar: "في البيئة النظيفة الخالية من الدخان، يتطلب توقف القلب إنعاشاً فورياً (CPR) وجهاز AED خلال 3 دقائق. لا تسحب مصاباً عبر الأدراج دون فحص تنفسه."
    }
  },
  {
    id: "3B",
    zoneId: "zone3",
    zoneName: { en: "Zone 3: Medical Aid & Emergencies", ar: "المنطقة 3: الإسعافات الطبية والطوارئ" },
    title: { en: "Non-Viable Victim under Fallen Concrete Beam", ar: "إصابة بالغة جداً وغير قابلة للحياة تحت ركام ثقيل" },
    department: { en: "Lower Archive & Storage Area", ar: "قسم الأرشيف والمستودعات السفلية" },
    description: {
      en: "In a basement storage room where a heavy concrete structure collapsed, you discover someone trapped with obvious fatal injuries that cannot be survived. The ceiling above you is cracking and plaster is falling.",
      ar: "في مستودع الأرشيف حيث انهار عمود خرساني ثقيل، عثرت على شخص محتجز يعاني من إصابات بالغة جداً وواضحة لا تسمح بالحياة إطلاقاً. بدأ سقف الغرفة بالتصدع وتساقط الجبس."
    },
    environment: {
      heat: { en: "Very Hot", ar: "حرارة عالية جداً", status: "danger" },
      smoke: { en: "Dust & Smoke", ar: "غبار ودخان خانق", status: "heavy" },
      people: { en: "Fatal Trauma", ar: "حالة وفاة مؤكدة" },
      urgency: { en: "Imminent Ceiling Collapse", ar: "خطر انهيار إضافي وشيك" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Locate an emergency pry bar from the nearby maintenance cabinet and attempt to lift the concrete beam, ensuring no colleague is left behind in the damaged basement section.",
          ar: "البحث عن عتلة طوارئ من خزانة الصيانة المجاورة ومحاولة رفع العمود الخرساني، حرصاً على عدم ترك أي زميل خلفك في قطاع القبو المتضرر."
        },
        correct: false
      },
      {
        id: "B",
        text: {
          en: "Prioritize the safety of living colleagues, note the exact room number on your sweep checklist, close the door, and report the precise location to the emergency leader outside.",
          ar: "إعطاء الأولوية لسلامة الزملاء الأحياء، وتدوين رقم الغرفة بدقة في قائمة المسح، وإغلاق الباب، وإبلاغ قائد الطوارئ بالخارج بالموقع المحدد."
        },
        correct: true
      },
      {
        id: "C",
        text: {
          en: "Attempt to pull the casualty free by their shoulders to relocate them into the hallway corridor before proceeding with the remaining room checks on this basement level.",
          ar: "محاولة سحب المصاب من كتفيه لنقله إلى مسار الممر العام قبل استكمال عمليات تفقد بقية الغرف في طابق القبو هذا."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Check Survivability", ar: "الخطوة 1: التأكد من استحالة النجاة" },
        text: { en: "Recognize obvious fatal trauma quickly without taking reckless risks that could harm you or other staff.", ar: "إدراك حالات الوفاة المؤكدة بسرعة دون المخاطرة بحياتك تحت أسقف متصدعة." }
      },
      step2: {
        title: { en: "Step 2: Prioritize the Living", ar: "الخطوة 2: حماية أرواح الأحياء" },
        text: { en: "Never risk your life or delay surviving colleagues to move someone who has already passed away.", ar: "عدم تعريض حياتك للخطر أو تأخير خروج زملائك الأحياء لنقل المتوفين." }
      },
      step3: {
        title: { en: "Step 3: Mark & Report Room", ar: "الخطوة 3: تسجيل الموقع وإبلاغ القيادة" },
        text: { en: "Close the door, write down the room number, and give the exact spot to emergency rescue teams outside.", ar: "إغلاق الباب وتسجيل رقم الغرفة بدقة وتسليمه لفرق الإنقاذ المتخصصة بالخارج." }
      }
    },
    explanation: {
      en: "Safety principles require wardens to prioritize living people. When someone has fatal non-survivable injuries, mark their location, evacuate safely, and let specialized rescue teams handle recovery.",
      ar: "مبادئ السلامة تفرض إعطاء الأولوية دائماً لحماية الأحياء. في حالات الوفاة المؤكدة، سجل الموقع واخرج بأمان وأبلغ فرق الإنقاذ المتخصصة."
    }
  },
  {
    id: "4A",
    zoneId: "zone4",
    zoneName: { en: "Zone 4: Accessibility & Special Care", ar: "المنطقة 4: دعم ذوي الإعاقة وكبار السن" },
    title: { en: "Colleague in a Wheelchair at the Exit Stairs", ar: "زميل يستخدم كرسياً متحركاً عند مدخل الدرج" },
    department: { en: "3rd Floor Emergency Stairwell Landing", ar: "مدخل درج الطوارئ بالدور الثالث" },
    description: {
      en: "You reach the fire exit stairs with a colleague who uses a wheelchair. Elevators are shut down for fire safety. The stairwell landing is protected by heavy fire doors with clean air.",
      ar: "وصلت إلى مدخل درج الطوارئ برفقة زميل يستخدم كرسياً متحركاً. توقفت المصاعد لسلامة الحريق. بسطة الدرج محمية بأبواب حريق والهواء بداخلها نظيف."
    },
    environment: {
      heat: { en: "Safe Inside Stairs", ar: "آمن داخل بيت الدرج", status: "normal" },
      smoke: { en: "None in Stairwell", ar: "لا يوجد دخان بالدرج", status: "none" },
      people: { en: "1 Wheelchair User", ar: "زميل من ذوي الإعاقة الحركية" },
      urgency: { en: "Cannot Use Stairs Alone", ar: "لا يمكنه النزول بمفرده" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Use an authorized warden key to override the safety lockout on passenger elevator two, transporting the wheelchair occupant down to the ground floor reception lobby rapidly.",
          ar: "استخدام مفتاح مرخص لإلغاء القفل الآمن لمصعد الركاب رقم اثنين، ونقل صاحب الكرسي المتحرك سريعاً لبهو الاستقبال بالدور الأرضي."
        },
        correct: false
      },
      {
        id: "B",
        text: {
          en: "Guide the colleague into the fire-protected stairwell refuge area, assign two evacuation buddies to stay with them, and communicate their exact floor landing location to the rescue team.",
          ar: "توجيه الزميل إلى منطقة الملجأ المحمية داخل بيت الدرج، وتعيين مرافقين اثنين للبقاء معه، وإبلاغ فريق الإنقاذ بموقع بسطة الدور بدقة."
        },
        correct: true
      },
      {
        id: "C",
        text: {
          en: "Enlist four colleagues to lift the heavy motorized wheelchair and carry it down multiple flights of stairs alongside the dense crowd of employees descending the stairwell.",
          ar: "الاستعانة بأربعة زملاء لرفع الكرسي المتحرك الكهربائي الثقيل وحمله عبر عدة طوابق من الدرج وسط التدافع الكثيف للموظفين النازلين."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Never Use Elevators in Fires", ar: "الخطوة 1: ممنوع استخدام المصاعد تماماً" },
        text: { en: "Elevators can get stuck, lose power, or fill with smoke, and must never be used in a fire alarm.", ar: "المصاعد قد تتعطل فجأة أو تنقطع عنها الكهرباء أو تمتلئ بالدخان، ويحظر استخدامها تماماً في الحرائق." }
      },
      step2: {
        title: { en: "Step 2: Use Protected Stair Refuge", ar: "الخطوة 2: استخدام ملجأ بيت الدرج المحمي" },
        text: { en: "Stairwell landings have fire-rated doors and fresh air, making them safe waiting areas.", ar: "بسطات الأدراج محمية بأبواب حريق عازلة ومقاومة للنيران، وهي أماكن انتظار آمنة ومخصصة لذلك." }
      },
      step3: {
        title: { en: "Step 3: Assign Buddies & Report Floor", ar: "الخطوة 3: تعيين مساعدين وإبلاغ الفريق" },
        text: { en: "Leave two colleagues with them for safety and tell the rescue team outside to send an evacuation carry team.", ar: "إبقاء زميلين معه للدعم والمساعدة وإبلاغ فرق الإنقاذ بالخارج لإرسال كرسي إخلاء متخصص." }
      }
    },
    explanation: {
      en: "Elevators are death traps in fires. Stair landings are fire-protected areas where people with reduced mobility wait safely with two assigned buddies until trained carry teams arrive.",
      ar: "المصاعد خطرة جداً في الحرائق. بسطات الأدراج هي مناطق ملاذ آمن ومحمية ضد الحريق، حيث ينتظر الشخص مع مساعدين اثنين حتى وصول فريق النقل المتخصص."
    }
  },
  {
    id: "4B",
    zoneId: "zone4",
    zoneName: { en: "Zone 4: Accessibility & Special Care", ar: "المنطقة 4: دعم ذوي الإعاقة وكبار السن" },
    title: { en: "Colleague with Hearing Loss Working with Headphones", ar: "زميل يعاني من ضعف السمع ويعمل بسماعات الرأس" },
    department: { en: "Customer Support & Data Entry Office", ar: "مكتب دعم العملاء وإدخال البيانات" },
    description: {
      en: "You check a side office and find a colleague with hearing loss wearing noise-cancelling headphones, typing with their back to the door. The visual flashing alarm light in their room has burned out, and they have no idea the building alarm is sounding.",
      ar: "أثناء تفقد المكاتب، وجدت زميلاً يعاني من ضعف السمع يرتدي سماعات رأس عازلة وظهره للباب. مصباح الإنذار الضوئي في غرفته محترق، ولا يعلم إطلاقاً بأن إنذار المبنى يدوي."
    },
    environment: {
      heat: { en: "Normal", ar: "طبيعية", status: "normal" },
      smoke: { en: "Light in Hallway", ar: "دخان خفيف بالممر", status: "light" },
      people: { en: "1 Unaware Colleague", ar: "موظف لم ينتبه للإنذار" },
      urgency: { en: "Needs Direct Alert", ar: "يحتاج تنبيهاً مباشراً" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Flick the room light switches, sweep a flashlight across their desk, establish direct eye contact, write 'EVACUATE NOW' on a note, and accompany them toward the exit corridor.",
          ar: "إطفاء وإضاءة مفاتيح أنوار الغرفة، وتمرير ضوء كشاف يدوي أمام مكتبه، وإجراء تواصل بصري، وكتابة 'إخلاء الآن'، ومرافقته باتجاه ممر الخروج."
        },
        correct: true
      },
      {
        id: "B",
        text: {
          en: "Stand at the doorway and call out loudly at maximum volume, tapping repeatedly on the metal doorframe to send acoustic vibrations through their noise-canceling headphones.",
          ar: "الوقوف عند المدخل والنداء بأعلى صوت، مع الطرق المتكرر على إطار الباب المعدني لإحداث اهتزازات صوتية تخترق سماعات الرأس العازلة."
        },
        correct: false
      },
      {
        id: "C",
        text: {
          en: "Rap sharply on the glass cubicle partition twice, point toward the exterior parking area, and continue along your sweep route assuming they will notice the vibration.",
          ar: "الطق بشدة على القاطع الزجاجي للمكتب مرتين، والإشارة باتجاه مواقف السيارات الخارجية، واستكمال مسار المسح بافتراض أنه سيشعر بالاهتزاز ويخرج."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Notice Broken Strobe Light", ar: "الخطوة 1: ملاحظة تعطل المصباح الضوئي" },
        text: { en: "If the flashing visual alarm light fails, a person with hearing loss has no way to know an alarm is sounding.", ar: "عند تعطل مصباح الإنذار الضوئي، لا يملك من يعاني من ضعف السمع أي وسيلة لمعرفة وجود إنذار." }
      },
      step2: {
        title: { en: "Step 2: Use Light Switches & Eye Contact", ar: "الخطوة 2: وميض الإضاءة والتواصل البصري" },
        text: { en: "Flick the room lights and step in front of them so they can see you without being frightened.", ar: "إطفاء وإضاءة أنوار الغرفة والوقوف في مجال رؤيته حتى ينتبه بهدوء دون فزع مفاجئ." }
      },
      step3: {
        title: { en: "Step 3: Write 'EVACUATE' & Walk Together", ar: "الخطوة 3: كتابة كلمة 'إخلاء' والمرافقة" },
        text: { en: "Show a clear written note or phone screen reading 'FIRE ALARM - EVACUATE' and walk them out to the exit.", ar: "عرض ملاحظة مكتوبة بخط كبير 'إنذار حريق - إخلاء' ومرافقته للخروج مع الفريق." }
      }
    },
    explanation: {
      en: "Visual alerts (flicking light switches or waving a flashlight) and clear written words are the only reliable way to help colleagues with hearing loss when strobe lights fail.",
      ar: "استخدام وميض الإنارة والتواصل البصري والكتابة الواضحة هي الوسيلة المضمونة لتنبيه ذوي الإعاقة السمعية ومساعدتهم على الإخلاء الآمن."
    }
  },
  {
    id: "5A",
    zoneId: "zone5",
    zoneName: { en: "Zone 5: Exit Doors & Fire Safety", ar: "المنطقة 5: أبواب الخروج والسلامة من الحريق" },
    title: { en: "Small Trashbin Fire vs Big Server Room Fire", ar: "حريق سلة مهملات صغيرة مقابل حريق خوادم كبير" },
    department: { en: "1st Floor IT Room near Exit Corridor", ar: "غرفة تقنية المعلومات بالدور الأول قرب مخرج الطوارئ" },
    description: {
      en: "Checking the final office before the exit, you see a small paper bin smoldering. But right behind the glass wall, a tall server rack is engulfed in ceiling-high flames with thick black smoke pouring out.",
      ar: "أثناء تفقد آخر غرفة قبل المخرج، رأيت سلة أوراق صغيرة تحترق، ولكن خلف القاطع الزجاجي مباشرة تشتعل خزانة خوادم كبيرة بلهب يمتد للسقف مع دخان أسود كثيف."
    },
    environment: {
      heat: { en: "Extreme Server Heat", ar: "حرارة شديدة جداً", status: "danger" },
      smoke: { en: "Heavy Black Toxic Smoke", ar: "دخان أسود كثيف وسام", status: "heavy" },
      people: { en: "Staff Cleared Ahead", ar: "الموظفون خرجوا للأمام" },
      urgency: { en: "Immediate Danger - Exit Now", ar: "خطر فوري - اخرج فوراً" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Retrieve a handheld carbon dioxide extinguisher from the hallway cabinet, enter the server room, and discharge the unit directly toward the base of the ceiling-high server flames.",
          ar: "إحضار مطفأة ثاني أكسيد الكربون من كابينة الممر، والدخول لغرفة الخوادم، وتفريغ المطفأة مباشرة باتجاه قاعدة لهب الخوادم الممتد للسقف."
        },
        correct: false
      },
      {
        id: "B",
        text: {
          en: "Recognize that the fire exceeds extinguisher capability, crawl low beneath the smoke layer, close the door firmly to contain the blaze, and evacuate through the emergency exit.",
          ar: "إدراك أن الحريق يتجاوز قدرة المطفأة اليدوية، والزحف منخفضاً تحت طبقة الدخان، وإغلاق الباب بإحكام لاحتواء الحريق، والإخلاء عبر مخرج الطوارئ."
        },
        correct: true
      },
      {
        id: "C",
        text: {
          en: "Leave the server room door wide open to allow smoke venting into the hallway, and locate the main electrical distribution panel to shut down the server power circuits.",
          ar: "ترك باب غرفة الخوادم مفتوحاً بالكامل للسماح بخروج الدخان للممر، والبحث عن لوحة التوزيع الكهربائية الرئيسية لفصل دوائر الطاقة عن الخوادم."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Know Fire Extinguisher Limits", ar: "الخطوة 1: معرفة حدود مطفأة الحريق" },
        text: { en: "Office extinguishers are only made for tiny incipient fires like a wastebasket. Once flames reach the ceiling, you must never fight it.", ar: "طفايات المكاتب مخصصة فقط للحرائق الصغيرة جداً مثل سلة مهملات، وإذا امتدت النيران للسقف يحظر مكافحتها." }
      },
      step2: {
        title: { en: "Step 2: Crawl Low Under Smoke", ar: "الخطوة 2: الزحف منخفضاً تحت الدخان" },
        text: { en: "Drop to your hands and knees where air is cooler and cleaner to avoid breathing toxic fumes.", ar: "النزول قريباً من الأرض حيث يكون الهواء أقل حرارة وخالياً من الغازات السامة لتسهيل التنفس." }
      },
      step3: {
        title: { en: "Step 3: Close Fire Door & Flee", ar: "الخطوة 3: إغلاق الباب والهروب" },
        text: { en: "Firmly shut the fire door behind you to cut off oxygen and protect the exit corridor for other people.", ar: "إغلاق باب الحريق بإحكام لقطع الأكسجين عن النار وحماية ممر الخروج للجميع، ثم المغادرة فوراً." }
      }
    },
    explanation: {
      en: "Once flames touch the ceiling, a fire cannot be fought with an office extinguisher. Dropping low keeps you breathing, and closing the door starves the fire and protects the escape corridor.",
      ar: "بمجرد وصول النيران للسقف تصبح المكافحة بالمطافئ العادية مستحيلة. الزحف يحميك من استنشاق الدخان السام، وإغلاق الأبواب يمنع انتشار الحريق ويحمي مسار النجاة."
    }
  }
];

export default function App() {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [screen, setScreen] = useState<0 | 1 | 3>(0);

  // User details
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [validationError, setValidationError] = useState('');

  // Drill State
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  // Time & Penalties (6:00 min = 360s)
  const [countdownSeconds, setCountdownSeconds] = useState(360);
  const [rawElapsedSeconds, setRawElapsedSeconds] = useState(0);
  const [penaltySecondsAdded, setPenaltySecondsAdded] = useState(0);
  const [penaltiesCount, setPenaltiesCount] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [penaltyFlash, setPenaltyFlash] = useState(false);

  // User History Log
  const [answersLog, setAnswersLog] = useState<Array<{
    scenarioId: string;
    zoneId: string;
    selectedId: string;
    correct: boolean;
    title: string;
    actionSummary: string;
    takeaway: string;
  }>>([]);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Robust cross-browser seamless scroll to top
  const smoothScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (document.documentElement) {
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (document.body) {
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Floor countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && screen === 1) {
      interval = setInterval(() => {
        setRawElapsedSeconds(prev => prev + 1);
        setCountdownSeconds(prev => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, screen]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleStartDrill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !employeeId.trim()) {
      setValidationError(lang === 'en' ? 'Please enter your Full Name and Employee ID.' : 'يرجى إدخال الاسم الكامل والرقم الوظيفي.');
      return;
    }
    setValidationError('');
    setScenarioIdx(0);
    setSelectedOptId(null);
    setIsAnswerSubmitted(false);
    setLastCorrect(null);
    setAnswersLog([]);
    setCountdownSeconds(360);
    setRawElapsedSeconds(0);
    setPenaltySecondsAdded(0);
    setPenaltiesCount(0);
    setIsTimerRunning(true);
    setScreen(1);
    smoothScrollToTop();
  };

  const currentSc = SCENARIOS[scenarioIdx];
  const currentZone = ZONES_LIST.find(z => z.id === currentSc.zoneId) || ZONES_LIST[0];

  const handleSelectOption = (optId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOptId(optId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptId || isAnswerSubmitted) return;
    const opt = currentSc.options.find(o => o.id === selectedOptId);
    if (!opt) return;

    const isCorrect = opt.correct;
    setIsAnswerSubmitted(true);
    setLastCorrect(isCorrect);

    const actionSummary = `1. ${currentSc.actionSteps.step1.title.en} -> 2. ${currentSc.actionSteps.step2.title.en} -> 3. ${currentSc.actionSteps.step3.title.en}`;

    setAnswersLog(prev => [
      ...prev,
      {
        scenarioId: currentSc.id,
        zoneId: currentSc.zoneId,
        selectedId: selectedOptId,
        correct: isCorrect,
        title: currentSc.title.en,
        actionSummary: actionSummary,
        takeaway: currentSc.explanation.en
      }
    ]);

    if (!isCorrect) {
      setPenaltySecondsAdded(prev => prev + 30);
      setPenaltiesCount(prev => prev + 1);
      setCountdownSeconds(prev => Math.max(0, prev - 30));
      setPenaltyFlash(true);
      setTimeout(() => setPenaltyFlash(false), 800);
    }

    // Seamless scroll to top on answer submit
    smoothScrollToTop();
  };

  const handleNextScenario = () => {
    if (scenarioIdx < SCENARIOS.length - 1) {
      setScenarioIdx(prev => prev + 1);
      setSelectedOptId(null);
      setIsAnswerSubmitted(false);
      setLastCorrect(null);
      smoothScrollToTop();
    } else {
      setIsTimerRunning(false);
      setScreen(3);
      smoothScrollToTop();

      const totalCorrect = answersLog.filter(a => a.correct).length;
      const scorePct = Math.round((totalCorrect / SCENARIOS.length) * 100);
      if (scorePct >= 80) {
        try {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      }
    }
  };

  const handleRestart = () => {
    setScreen(0);
    smoothScrollToTop();
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalCorrect = answersLog.filter(a => a.correct).length;
  const scorePercentage = Math.round((totalCorrect / SCENARIOS.length) * 100);
  const isPassed = scorePercentage >= 80;
  const isPerfectRun = scorePercentage === 100 && penaltiesCount === 0;
  const totalAdjustedTime = rawElapsedSeconds + penaltySecondsAdded;

  // --- OFFICIAL AUDIT PDF GENERATION (STRICTLY ENGLISH & MULTI-PAGE TO PREVENT OVERLAPS) ---
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const cleanId = (employeeId || 'WARDEN').replace(/[^a-zA-Z0-9-_]/g, '');
      const reportNumber = `KSIA-EVAC-${Date.now().toString().slice(-6)}-${cleanId}`;

      // Helper function to style page background
      const drawPageBackground = (pageNum: number) => {
        doc.setFillColor(15, 23, 42); // Navy Slate
        doc.rect(0, 0, 595.28, 841.89, 'F');
        doc.setFillColor(250, 204, 21); // Hazard Yellow
        doc.rect(0, 0, 595.28, 6, 'F');
        doc.setDrawColor(51, 65, 85);
        doc.setLineWidth(1);
        doc.rect(20, 20, 555.28, 801.89, 'S');

        // Page number footer
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${pageNum} of 2 · Report ID: ${reportNumber}`, 297.64, 814, { align: 'center' });
      };

      // ================= PAGE 1 =================
      drawPageBackground(1);

      // Header Banner Box
      doc.setFillColor(30, 41, 59);
      doc.rect(22, 22, 551.28, 68, 'F');

      doc.setTextColor(250, 204, 21);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text("KING SALMAN INTERNATIONAL AIRPORT (KSIA) - RIYADH", 36, 44);

      doc.setTextColor(241, 245, 249);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.text("ADMINISTRATION COMPLEX - OFFICE EVACUATION & ROOM SWEEP DRILL", 36, 60);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text("Official Employee Safety Drill & Egress Verification Report", 36, 74);

      // Status Badge (Top Right)
      doc.setFillColor(isPassed ? 22 : 220, isPassed ? 163 : 38, isPassed ? 74 : 38);
      doc.roundedRect(432, 32, 128, 48, 4, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(isPassed ? "STATUS: PASSED" : "STATUS: RETEST", 442, 52);
      doc.setFontSize(8);
      doc.text(`SCORE: ${scorePercentage}% (${totalCorrect}/9)`, 442, 68);

      // Employee Information Box
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(32, 98, 531.28, 56, 3, 3, 'F');

      doc.setTextColor(250, 204, 21);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text("EMPLOYEE CREDENTIALS", 44, 114);

      doc.setTextColor(241, 245, 249);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(`Full Name: ${fullName.toUpperCase()}`, 44, 130);
      doc.text(`Employee ID: ${employeeId}`, 44, 144);

      doc.text(`Assessment Date: ${assessmentDate}`, 310, 130);
      doc.text(`Certificate UID: ${reportNumber}`, 310, 144);

      // Performance Summary Box
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(32, 162, 531.28, 62, 3, 3, 'F');

      doc.setTextColor(250, 204, 21);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text("EVACUATION PERFORMANCE SUMMARY", 44, 178);

      const summaryCols = [
        { label: "Overall Score", val: `${scorePercentage}%`, sub: isPassed ? "PASSED (>= 80%)" : "NEEDS RETEST" },
        { label: "Active Drill Time", val: formatTime(rawElapsedSeconds), sub: "Execution Clock" },
        { label: "Hazard Delay Added", val: `+${penaltySecondsAdded}s`, sub: `${penaltiesCount} Wrong Choices` },
        { label: "Total Egress Time", val: formatTime(totalAdjustedTime), sub: countdownSeconds > 0 ? "Target Met" : "Time Exceeded" }
      ];

      summaryCols.forEach((col, idx) => {
        const xPos = 44 + idx * 132;
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(col.label, xPos, 194);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10.5);
        doc.setFont('helvetica', 'bold');
        doc.text(col.val, xPos, 208);

        doc.setTextColor(col.label === "Overall Score" && isPassed ? 74 : 148, col.label === "Overall Score" && isPassed ? 222 : 163, col.label === "Overall Score" && isPassed ? 128 : 184);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(col.sub, xPos, 219);
      });

      // Section Title: Scenarios 1 to 4 on Page 1
      doc.setTextColor(250, 204, 21);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text("ROOM SWEEP AUDIT - PART 1 (ZONES 1 & 2)", 36, 242);

      let curY = 252;
      for (let i = 0; i < 4; i++) {
        const sc = SCENARIOS[i];
        const logItem = answersLog.find(a => a.scenarioId === sc.id);
        const correct = logItem ? logItem.correct : false;

        doc.setFillColor(i % 2 === 0 ? 30 : 22, i % 2 === 0 ? 41 : 30, i % 2 === 0 ? 59 : 45);
        doc.roundedRect(32, curY, 531.28, 64, 3, 3, 'F');

        doc.setFillColor(correct ? 22 : 220, correct ? 163 : 38, correct ? 74 : 38);
        doc.rect(32, curY, 4, 64, 'F');

        doc.setTextColor(241, 245, 249);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`${sc.id}. ${sc.title.en} (${sc.department.en})`, 42, curY + 14);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        if (correct) {
          doc.setTextColor(74, 222, 128);
          doc.text("CORRECT (0s penalty)", 435, curY + 14);
        } else {
          doc.setTextColor(248, 113, 113);
          doc.text("INCORRECT (+30s penalty)", 420, curY + 14);
        }

        doc.setTextColor(250, 204, 21);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        const pLine = `Action Steps: 1. ${sc.actionSteps.step1.title.en} | 2. ${sc.actionSteps.step2.title.en} | 3. ${sc.actionSteps.step3.title.en}`;
        doc.text(pLine, 42, curY + 30);

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7);
        const takeLine = `Key Takeaway: ${sc.explanation.en}`;
        const splitLines = doc.splitTextToSize(takeLine, 500);
        doc.text(splitLines[0] || "", 42, curY + 44);
        if (splitLines[1]) {
          doc.text(splitLines[1], 42, curY + 54);
        }

        curY += 72;
      }

      // ================= PAGE 2 =================
      doc.addPage();
      drawPageBackground(2);

      // Running Header on Page 2
      doc.setFillColor(30, 41, 59);
      doc.rect(22, 22, 551.28, 40, 'F');
      doc.setTextColor(250, 204, 21);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text("KING SALMAN INTERNATIONAL AIRPORT (KSIA) - AUDIT REPORT (CONTINUED)", 36, 44);
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text(`Employee: ${fullName.toUpperCase()} (${employeeId})`, 420, 44);

      doc.setTextColor(250, 204, 21);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text("ROOM SWEEP AUDIT - PART 2 (ZONES 3, 4 & 5)", 36, 80);

      let p2Y = 92;
      for (let i = 4; i < SCENARIOS.length; i++) {
        const sc = SCENARIOS[i];
        const logItem = answersLog.find(a => a.scenarioId === sc.id);
        const correct = logItem ? logItem.correct : false;

        doc.setFillColor(i % 2 === 0 ? 30 : 22, i % 2 === 0 ? 41 : 30, i % 2 === 0 ? 59 : 45);
        doc.roundedRect(32, p2Y, 531.28, 64, 3, 3, 'F');

        doc.setFillColor(correct ? 22 : 220, correct ? 163 : 38, correct ? 74 : 38);
        doc.rect(32, p2Y, 4, 64, 'F');

        doc.setTextColor(241, 245, 249);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`${sc.id}. ${sc.title.en} (${sc.department.en})`, 42, p2Y + 14);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        if (correct) {
          doc.setTextColor(74, 222, 128);
          doc.text("CORRECT (0s penalty)", 435, p2Y + 14);
        } else {
          doc.setTextColor(248, 113, 113);
          doc.text("INCORRECT (+30s penalty)", 420, p2Y + 14);
        }

        doc.setTextColor(250, 204, 21);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        const pLine = `Action Steps: 1. ${sc.actionSteps.step1.title.en} | 2. ${sc.actionSteps.step2.title.en} | 3. ${sc.actionSteps.step3.title.en}`;
        doc.text(pLine, 42, p2Y + 30);

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(7);
        const takeLine = `Key Takeaway: ${sc.explanation.en}`;
        const splitLines = doc.splitTextToSize(takeLine, 500);
        doc.text(splitLines[0] || "", 42, p2Y + 44);
        if (splitLines[1]) {
          doc.text(splitLines[1], 42, p2Y + 54);
        }

        p2Y += 72;
      }

      // Verification Sign-off Box on Page 2
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(32, p2Y + 8, 531.28, 56, 3, 3, 'F');

      doc.setTextColor(250, 204, 21);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text("OFFICIAL SAFETY & EMERGENCY PREPAREDNESS RECORD", 44, p2Y + 26);

      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text("King Salman International Airport (KSIA) Administration Complex · Life Safety & Egress Protocol", 44, p2Y + 38);
      doc.text(`Electronic Verification Token: ${reportNumber} · Certified Clean Record`, 44, p2Y + 50);

      // Save PDF
      doc.save(`KSIA_Evacuation_Report_${cleanId}.pdf`);
    } catch {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Top Mobile Header (Compact & clean) */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-3.5 py-2.5 shadow-md">
        <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xs shadow shrink-0">
              ⚡
            </div>
            <div className="leading-tight">
              <div className="font-extrabold text-xs sm:text-sm tracking-wide text-white uppercase flex items-center gap-1.5">
                <span>KSIA Riyadh</span>
                <span className="text-amber-400 text-[9px] font-mono px-1 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
                  DRILL
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[170px] sm:max-w-xs">
                {lang === 'en' ? 'Administration Complex' : 'مجمع الإدارة'}
              </div>
            </div>
          </div>

          {/* Right Controls: Timer & Language Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {screen === 1 && (
              <div className={`px-2 py-1 rounded font-mono font-bold text-xs flex items-center gap-1 ${
                penaltyFlash ? 'bg-red-950 text-red-400 border border-red-500 penalty-pulse' :
                countdownSeconds < 60 ? 'bg-red-950/80 text-red-400 border border-red-600/60 animate-pulse' :
                'bg-slate-900 text-amber-400 border border-slate-700'
              }`}>
                <span>⏱ {formatTime(countdownSeconds)}</span>
              </div>
            )}

            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 text-xs font-bold transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'العربية' : 'EN'}
            </button>
          </div>

        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-md md:max-w-2xl mx-auto px-3.5 py-4 sm:py-6">

        {/* ================= SCREEN 0: REGISTRATION ================= */}
        {screen === 0 && (
          <div className="space-y-4">
            
            {/* Mission Hero Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 sm:p-6 shadow-xl space-y-2.5">
              <div className="text-amber-400 text-[11px] font-bold uppercase tracking-wider">
                King Salman International Airport · Riyadh
              </div>
              
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {lang === 'en' ? 'Office Evacuation & Room Sweeping Drill' : 'تمرين إخلاء المكاتب ومسح الغرف'}
              </h1>
              
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {lang === 'en'
                  ? 'Interactive emergency preparedness training for office staff. Practice making the right decisions room by room during an office evacuation. Passing score is 80% or higher.'
                  : 'تدريب تفاعلي للسلامة وإخلاء المكاتب لموظفي الإدارة. تدرب على اتخاذ القرارات الصحيحة غرفة بغرفة أثناء الإخلاء. نسبة النجاح 80% أو أعلى.'
                }
              </p>

              {/* 4 Clean Mobile Parameters */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-700/80 flex items-start gap-2">
                  <span className="text-amber-400 text-base">⏱️</span>
                  <div>
                    <div className="text-[11px] font-bold text-slate-100">{lang === 'en' ? '6:00 Min Timer' : 'مؤقت 6:00 دقائق'}</div>
                    <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Floor sweep clock' : 'مؤقت إخلاء الدور'}</div>
                  </div>
                </div>

                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-700/80 flex items-start gap-2">
                  <span className="text-red-400 text-base">⚠️</span>
                  <div>
                    <div className="text-[11px] font-bold text-slate-100">{lang === 'en' ? '+30s Penalty' : 'عقوبة +30 ثانية'}</div>
                    <div className="text-[10px] text-slate-400">{lang === 'en' ? 'On wrong choices' : 'للخيارات الخاطئة'}</div>
                  </div>
                </div>

                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-700/80 flex items-start gap-2">
                  <span className="text-emerald-400 text-base">🎯</span>
                  <div>
                    <div className="text-[11px] font-bold text-slate-100">{lang === 'en' ? 'Pass >= 80%' : 'النجاح >= 80%'}</div>
                    <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Passing grade' : 'درجة الاجتياز'}</div>
                  </div>
                </div>

                <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-700/80 flex items-start gap-2">
                  <span className="text-blue-400 text-base">📥</span>
                  <div>
                    <div className="text-[11px] font-bold text-slate-100">{lang === 'en' ? 'PDF Report' : 'تقرير رسمي'}</div>
                    <div className="text-[10px] text-slate-400">{lang === 'en' ? 'Download at end' : 'تحميل بنهاية التمرين'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Inputs Card */}
            <form onSubmit={handleStartDrill} className="bg-slate-800 rounded-2xl border border-slate-700 p-4 sm:p-6 shadow-xl space-y-3.5">
              <div className="border-b border-slate-700 pb-2.5">
                <h2 className="text-base font-bold text-white">
                  {lang === 'en' ? 'Participant Registration' : 'تسجيل بيانات المشارك'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {lang === 'en' ? 'Enter details before starting the drill.' : 'أدخل بياناتك قبل بدء التدريب.'}
                </p>
              </div>

              {validationError && (
                <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500 text-red-200 text-xs">
                  {validationError}
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-200 uppercase">
                    {lang === 'en' ? 'Full Name' : 'الاسم الكامل'} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Tariq Al-Ghamdi' : 'مثال: طارق الغامدي'}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-200 uppercase">
                    {lang === 'en' ? 'Employee ID' : 'الرقم الوظيفي'} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. KSIA-4821"
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-200 uppercase">
                    {lang === 'en' ? 'Training Date' : 'تاريخ التدريب'}
                  </label>
                  <input
                    type="date"
                    value={assessmentDate}
                    onChange={(e) => setAssessmentDate(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98] shadow-lg shadow-amber-400/20"
              >
                <span>{lang === 'en' ? 'Start Evacuation Drill' : 'بدء تمرين الإخلاء'}</span>
                <span>➔</span>
              </button>
            </form>

          </div>
        )}

        {/* ================= SCREEN 1: DRILL & SCENARIO ENGINE ================= */}
        {screen === 1 && (
          <div className="space-y-3.5">
            
            {/* Zone & Progress Indicator Card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 sm:p-4 shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <span>{currentZone.icon}</span>
                  <span className="uppercase text-[11px] tracking-wide">
                    {currentZone.code} · {currentZone.name[lang]}
                  </span>
                </div>
                <div className="font-mono text-slate-400 text-[11px]">
                  {scenarioIdx + 1} / {SCENARIOS.length}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="grid grid-cols-5 gap-1 pt-0.5">
                {ZONES_LIST.map((zone) => {
                  const isCurrent = zone.id === currentSc.zoneId;
                  const isPast = SCENARIOS.findIndex(s => s.zoneId === zone.id) < scenarioIdx;
                  return (
                    <div 
                      key={zone.id}
                      className={`h-1.5 rounded-full transition-all ${
                        isCurrent 
                          ? 'bg-amber-400 ring-2 ring-amber-400/30' 
                          : isPast 
                          ? 'bg-emerald-500' 
                          : 'bg-slate-950 border border-slate-700'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Main Scenario Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-3.5 sm:p-5 shadow-xl space-y-3.5">
              
              {/* Header Title & Department */}
              <div>
                <div className="text-[10px] sm:text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                  📍 {currentSc.department[lang]}
                </div>
                <h2 className="text-base sm:text-lg font-black text-white leading-snug mt-0.5">
                  {currentSc.title[lang]}
                </h2>
              </div>

              {/* ⭐ REALISTIC PHOTOGRAPHIC SCENARIO ASSET ⭐ */}
              <ScenarioIllustration scenarioId={currentSc.id} />

              {/* Situation Description Text */}
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-700/80">
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                  {currentSc.description[lang]}
                </p>
              </div>

              {/* Clean Quick Room Indicators (Single Row on Mobile) */}
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-medium">
                <div className="bg-slate-950 py-1.5 px-1 rounded-lg border border-slate-800">
                  <div className="text-slate-400">🌡️ {lang === 'en' ? 'Heat' : 'الحرارة'}</div>
                  <div className={`font-bold truncate mt-0.5 ${currentSc.environment.heat.status === 'danger' ? 'text-red-400' : currentSc.environment.heat.status === 'warm' ? 'text-amber-400' : 'text-slate-200'}`}>
                    {currentSc.environment.heat[lang]}
                  </div>
                </div>

                <div className="bg-slate-950 py-1.5 px-1 rounded-lg border border-slate-800">
                  <div className="text-slate-400">🌫️ {lang === 'en' ? 'Smoke' : 'الدخان'}</div>
                  <div className={`font-bold truncate mt-0.5 ${currentSc.environment.smoke.status === 'heavy' ? 'text-red-400' : currentSc.environment.smoke.status === 'light' ? 'text-amber-400' : 'text-slate-200'}`}>
                    {currentSc.environment.smoke[lang]}
                  </div>
                </div>

                <div className="bg-slate-950 py-1.5 px-1 rounded-lg border border-slate-800">
                  <div className="text-slate-400">👥 {lang === 'en' ? 'People' : 'الأشخاص'}</div>
                  <div className="font-bold text-slate-200 truncate mt-0.5">
                    {currentSc.environment.people[lang]}
                  </div>
                </div>

                <div className="bg-slate-950 py-1.5 px-1 rounded-lg border border-slate-800">
                  <div className="text-slate-400">⚠️ {lang === 'en' ? 'Urgency' : 'الأهمية'}</div>
                  <div className="font-bold text-amber-300 truncate mt-0.5">
                    {currentSc.environment.urgency[lang]}
                  </div>
                </div>
              </div>

              {/* Choices (Equal Length, Equal Quality, Zero Giveaways) */}
              <div className="space-y-2.5 pt-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  {lang === 'en' ? 'Evaluate and select the most appropriate action:' : 'قيّم الموقف واختر الإجراء الأكثر ملاءمة:'}
                </div>

                {currentSc.options.map((option) => {
                  const isSelected = selectedOptId === option.id;

                  let optClass = "bg-slate-900 hover:bg-slate-850 border-slate-700/80 text-slate-200";

                  if (isSelected && !isAnswerSubmitted) {
                    optClass = "bg-amber-400/10 border-amber-400 text-white shadow-md ring-1 ring-amber-400";
                  }

                  if (isAnswerSubmitted) {
                    if (option.correct) {
                      optClass = "bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-1 ring-emerald-500";
                    } else if (isSelected && !option.correct) {
                      optClass = "bg-red-950/90 border-red-500 text-red-200 ring-1 ring-red-500";
                    } else {
                      optClass = "bg-slate-950/40 border-slate-800 text-slate-500 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full min-h-[48px] text-start p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed flex items-start gap-2.5 transition-all cursor-pointer ${optClass}`}
                    >
                      <span className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center font-bold text-xs font-mono mt-0.5 ${
                        isAnswerSubmitted && option.correct
                          ? "bg-emerald-500 text-slate-950"
                          : isAnswerSubmitted && isSelected && !option.correct
                          ? "bg-red-500 text-white"
                          : isSelected
                          ? "bg-amber-400 text-slate-950"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}>
                        {option.id}
                      </span>
                      <span className="flex-1">
                        {option.text[lang]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Confirm Choice CTA Button */}
              {!isAnswerSubmitted && (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={!selectedOptId}
                    onClick={handleSubmitAnswer}
                    className={`w-full min-h-[48px] py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      selectedOptId
                        ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 active:scale-[0.98]"
                        : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                    }`}
                  >
                    <span>{lang === 'en' ? 'Confirm Decision' : 'تأكيد القرار'}</span>
                    <span>➔</span>
                  </button>
                </div>
              )}

              {/* Feedback and 3-Step Procedure */}
              {isAnswerSubmitted && (
                <div className="space-y-3 pt-2">
                  
                  {/* Feedback Banner */}
                  {lastCorrect ? (
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-100 text-xs sm:text-sm">
                      <div className="font-bold text-emerald-300 flex items-center gap-1.5 mb-0.5">
                        <span>✅</span>
                        <span>{lang === 'en' ? 'Optimal Decision!' : 'قرار تكتيكي سليم ومثالي!'}</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-emerald-200 leading-relaxed">
                        {currentSc.explanation[lang]}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-red-950/90 border border-red-500 text-red-100 text-xs sm:text-sm penalty-pulse">
                      <div className="font-bold text-red-300 flex items-center justify-between mb-0.5">
                        <span className="flex items-center gap-1.5">
                          <span>⚠️</span>
                          <span>{lang === 'en' ? 'Hazard Delay Penalty' : 'عقوبة تأخير خطر'}</span>
                        </span>
                        <span className="text-[10px] font-mono bg-red-900 text-red-200 px-1.5 py-0.5 rounded border border-red-500">
                          +30s
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-red-200 leading-relaxed">
                        {currentSc.explanation[lang]}
                      </p>
                    </div>
                  )}

                  {/* 3 Step Visual Action Card */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-400/30 space-y-2">
                    <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                      <span>{lang === 'en' ? 'Standard 3-Step Procedure:' : 'خطوات التصرف الثلاث المعتمدة:'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">1 ➔ 2 ➔ 3</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <div className="font-bold text-amber-300 text-[11px]">
                          1. {currentSc.actionSteps.step1.title[lang]}
                        </div>
                        <div className="text-slate-300 text-[10px] sm:text-[11px] leading-relaxed">
                          {currentSc.actionSteps.step1.text[lang]}
                        </div>
                      </div>

                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <div className="font-bold text-amber-300 text-[11px]">
                          2. {currentSc.actionSteps.step2.title[lang]}
                        </div>
                        <div className="text-slate-300 text-[10px] sm:text-[11px] leading-relaxed">
                          {currentSc.actionSteps.step2.text[lang]}
                        </div>
                      </div>

                      <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <div className="font-bold text-amber-300 text-[11px]">
                          3. {currentSc.actionSteps.step3.title[lang]}
                        </div>
                        <div className="text-slate-300 text-[10px] sm:text-[11px] leading-relaxed">
                          {currentSc.actionSteps.step3.text[lang]}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Proceed CTA */}
                  <button
                    type="button"
                    onClick={handleNextScenario}
                    className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98] shadow-lg shadow-amber-400/20"
                  >
                    <span>
                      {scenarioIdx < SCENARIOS.length - 1
                        ? (lang === 'en' ? 'Move to Next Room' : 'الانتقال إلى الغرفة التالية')
                        : (lang === 'en' ? 'Complete Drill & View Report' : 'إنهاء التدريب وعرض التقرير')}
                    </span>
                    <span>➔</span>
                  </button>

                </div>
              )}

            </div>

          </div>
        )}

        {/* ================= SCREEN 3: AUDIT & CERTIFICATION ================= */}
        {screen === 3 && (
          <div className="space-y-4">

            {/* Results Header Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 sm:p-6 shadow-xl text-center space-y-2.5">
              <div className="inline-block p-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-xl">
                🛡️
              </div>

              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  King Salman International Airport · Riyadh
                </span>
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                  Office Evacuation & Room Sweeping Report
                </h1>
              </div>

              {/* Status Stamp */}
              <div>
                <div className={`inline-block px-4 py-2 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase border ${
                  isPassed 
                    ? "bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-500/10" 
                    : "bg-red-950/90 text-red-300 border-red-500 shadow-lg shadow-red-500/10"
                }`}>
                  {isPassed ? "EVACUATION DRILL PASSED (>= 80%)" : "NEEDS RETEST (BELOW 80%)"}
                </div>

                {isPerfectRun && (
                  <div className="mt-1.5 text-xs font-bold text-amber-400 tracking-wider">
                    🌟 PERFECT DRILL RUN (ZERO MISTAKES)
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm mx-auto">
                {isPassed
                  ? "Congratulations! You have demonstrated good emergency awareness and life-safety procedures for your office floor."
                  : "Please review the safety guidelines and retake the drill to ensure you are ready to help your colleagues safely."}
              </p>
            </div>

            {/* Performance Overview (2x2 Grid on Mobile, No Overlap) */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Your Score</div>
                <div className={`text-xl sm:text-2xl font-black font-mono mt-0.5 ${isPassed ? "text-emerald-400" : "text-red-400"}`}>
                  {scorePercentage}%
                </div>
                <div className="text-[10px] text-slate-400">{totalCorrect} of {SCENARIOS.length} Correct</div>
              </div>

              <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Drill Time</div>
                <div className="text-xl sm:text-2xl font-black font-mono text-slate-100 mt-0.5">
                  {formatTime(rawElapsedSeconds)}
                </div>
                <div className="text-[10px] text-slate-400">Time Active</div>
              </div>

              <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Delay Added</div>
                <div className={`text-xl sm:text-2xl font-black font-mono mt-0.5 ${penaltiesCount > 0 ? "text-red-400" : "text-emerald-400"}`}>
                  +{penaltySecondsAdded}s
                </div>
                <div className="text-[10px] text-slate-400">{penaltiesCount} Wrong Answers</div>
              </div>

              <div className="bg-slate-800 rounded-xl p-3 border border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Time</div>
                <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-0.5">
                  {formatTime(totalAdjustedTime)}
                </div>
                <div className="text-[10px] text-slate-400">{countdownSeconds > 0 ? "Within 6:00 min" : "Time Exceeded"}</div>
              </div>
            </div>

            {/* 📥 BLEEPING YELLOW PDF DOWNLOAD CALL TO ACTION */}
            <div className="bg-slate-800/90 rounded-2xl border-2 border-amber-400/40 p-4 sm:p-6 shadow-2xl text-center space-y-3">
              <div className="text-amber-300 font-bold text-xs sm:text-sm">
                {lang === 'en' 
                  ? "Remember to download your report and share it in your team group!" 
                  : "تذكر تحميل تقريرك ومشاركته في مجموعة فريق عملك!"}
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="bleeping-yellow-btn min-h-[48px] w-full max-w-sm py-3.5 px-4 rounded-xl text-slate-950 font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2.5 transition-transform active:scale-95 cursor-pointer shadow-xl"
                >
                  {/* Clean Black Download Arrow Icon */}
                  <svg 
                    className="w-4 h-4 text-slate-950" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>DOWNLOAD OFFICIAL PDF REPORT</span>
                </button>
              </div>

              <div className="text-[10px] font-mono text-slate-400">
                Target File: <span className="text-amber-300 font-bold">KSIA_Evacuation_Report_{(employeeId || 'WARDEN').replace(/[^a-zA-Z0-9-_]/g, '')}.pdf</span>
              </div>
            </div>

            {/* ON-SCREEN AUDIT REPORT: NO OVERLAPPING TEXT, CLEAN MOBILE STACK */}
            <div ref={reportRef} className="bg-slate-850 rounded-2xl border border-slate-700 p-4 sm:p-5 shadow-xl space-y-4">
              
              <div className="border-b border-slate-700 pb-3">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">
                  Office Safety Evacuation Record
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                  Scenario Evaluation Summary
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-2.5 text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div>Employee: <span className="text-white font-bold block truncate">{fullName.toUpperCase()}</span></div>
                  <div>ID: <span className="text-white font-bold block">{employeeId}</span></div>
                  <div>Score: <span className="text-white font-bold block">{scorePercentage}%</span></div>
                  <div>Result: <span className={`font-bold block ${isPassed ? "text-emerald-400" : "text-red-400"}`}>{isPassed ? "PASSED" : "RETEST"}</span></div>
                </div>
              </div>

              {/* Review Rows */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Room Review Breakdown (All 9 Scenarios):
                </div>

                {SCENARIOS.map((sc, index) => {
                  const logItem = answersLog.find(a => a.scenarioId === sc.id);
                  const isOpt = logItem ? logItem.correct : false;

                  return (
                    <div 
                      key={sc.id} 
                      className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                        isOpt 
                          ? "bg-slate-900/90 border-slate-700/80 text-slate-200" 
                          : "bg-red-950/20 border-red-500/40 text-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-white text-xs leading-tight">
                          {index + 1}. {sc.title.en}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[9px] shrink-0 ${
                          isOpt 
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40" 
                            : "bg-red-950 text-red-400 border border-red-500/40"
                        }`}>
                          {isOpt ? "CORRECT (+0s)" : "INCORRECT (+30s)"}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400">
                        {sc.department.en} · Your Answer: Option {logItem ? logItem.selectedId : 'N/A'}
                      </div>

                      {/* Action Steps */}
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[10px] text-amber-300 space-y-0.5">
                        <div>1. {sc.actionSteps.step1.title.en}</div>
                        <div>2. {sc.actionSteps.step2.title.en}</div>
                        <div>3. {sc.actionSteps.step3.title.en}</div>
                      </div>

                      <div className="text-[10px] text-slate-300 leading-relaxed">
                        <span className="text-slate-200 font-semibold">Safety takeaway:</span> {sc.explanation.en}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Retake Drill */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleRestart}
                className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs sm:text-sm tracking-wide border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <span>🔄</span>
                <span>{lang === 'en' ? 'Retake Drill / Practice Again' : 'إعادة التدريب / المحاولة مرة أخرى'}</span>
              </button>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
