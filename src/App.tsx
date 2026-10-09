import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';

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
    step1: { title: { en: string; ar: string }; text: { en: string; ar: string }; icon: string };
    step2: { title: { en: string; ar: string }; text: { en: string; ar: string }; icon: string };
    step3: { title: { en: string; ar: string }; text: { en: string; ar: string }; icon: string };
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

const SCENARIOS: ScenarioData[] = [
  {
    id: "1A",
    zoneId: "zone1",
    zoneName: { en: "Zone 1: Open Office & Desks", ar: "المنطقة 1: المكاتب المفتوحة ومحطات العمل" },
    title: { en: "Colleague Frozen in Panic at Desk", ar: "زميل متجمد في مكانه بسبب الخوف" },
    department: { en: "Administration & Finance Office", ar: "مكتب الإدارة والمالية" },
    description: {
      en: "While sweeping the open office area as the fire alarm rings, you spot a colleague sitting motionless at their desk. Their hands are gripping the table, and they are staring blankly at the screen without moving or getting up to leave.",
      ar: "أثناء التأكد من إخلاء مكاتب الموظفين مع انطلاق جرس الإنذار، لاحظت زميلاً جالساً بلا حراك عند مكتبه، يمسك حافة الطاولة وينظر بذهول إلى الشاشة دون أن يستجيب أو يقف للمغادرة."
    },
    environment: {
      heat: { en: "Normal Room Temp", ar: "حرارة عادية", status: "normal" },
      smoke: { en: "Faint Smoke at Ceiling", ar: "دخان خفيف جداً بالسقف", status: "light" },
      people: { en: "1 Colleague Frozen in Chair", ar: "موظف واحد متجمد بمكانه", },
      urgency: { en: "Immediate Help Needed", ar: "يتطلب مساعدة فورية" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Call out to them from the office doorway, write down their desk number on your list, and assume they will follow the crowd once they see everyone leaving.",
          ar: "النداء عليه بصوت عالٍ من عند باب المكتب، وتسجيل رقم مكتبه في ورقة المتابعة، والافتراض بأنه سيتبع زملاءه بمجرد رؤيتهم يخرجون."
        },
        correct: false
      },
      {
        id: "B",
        text: {
          en: "Walk directly to their desk, place a firm hand on their shoulder, speak calmly to break their shock, and help them stand up to walk out together with the group.",
          ar: "التوجه مباشرة إلى مكتبه، ووضع يدك بثبات على كتفه، والتحدث معه بوضوح لإخراجه من حالة الصدمة، ومساعدته على الوقوف والمشي معاً مع المجموعة."
        },
        correct: true
      },
      {
        id: "C",
        text: {
          en: "Pull up a chair next to them, ask them to take slow deep breaths, and sit with them until they feel relaxed enough to start packing their work laptop.",
          ar: "سحب كرسي والجلوس بجانبه، والطلب منه أخذ أنفاس عميقة، والانتظار معه حتى يهدأ تماماً ويبدأ بجمع أغراضه وجهاز اللابتوب."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Spot Panic Shock", ar: "الخطوة 1: ملاحظة الصدمة والهلع" },
        text: { en: "Recognize that a frozen colleague is in shock and cannot stand up or evacuate on their own.", ar: "الانتباه إلى أن الزميل يمر بحالة تجمد نفسي ولا يستطيع التحرك بمفرده." },
        icon: "search"
      },
      step2: {
        title: { en: "Step 2: Touch Shoulder & Speak Calmly", ar: "الخطوة 2: لمس الكتف والحديث بحزم" },
        text: { en: "Place a reassuring hand on their shoulder and give a clear, firm instruction: 'Look at me, let's stand up now.'", ar: "وضع يدك على كتفه وتوجيه أمر بسيط ومباشر: 'انظر إليّ، دعنا نقف الآن ونخرج معاً'." },
        icon: "user"
      },
      step3: {
        title: { en: "Step 3: Walk Out Together", ar: "الخطوة 3: المرافقة حتى المخرج" },
        text: { en: "Hold their arm and keep them in the evacuation line until you are both safely outside.", ar: "الإمساك بذراعه والمشي معه بجانب الفريق حتى الوصول بأمان لنقطة التجمع." },
        icon: "exit"
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
      en: "While checking the meeting rooms, you meet an international visitor holding their laptop bag. They hear the emergency sirens and loudspeaker messages, but look completely confused, pointing at their heavy bags and wondering whether to pack up or leave.",
      ar: "أثناء تفقد غرف الاجتماعات، قابلت زائراً أجنبياً يحمل حقيبة لابتوب. يسمع صفارات الإنذار والإعلانات الصوتية لكنه يبدو محتاراً تماماً، ويشير إلى حقائبه الثقيلة متسائلاً هل يجمعها أم يخرج."
    },
    environment: {
      heat: { en: "Comfortable", ar: "معتدل", status: "normal" },
      smoke: { en: "Clean Air in Room", ar: "هواء نظيف بالغرفة", status: "none" },
      people: { en: "1 Confused Visitor", ar: "زائر واحد محتار", },
      urgency: { en: "Quick Guidance Needed", ar: "إرشاد سريع لتفادي التأخير" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Use clear, friendly hand gestures pointing toward the exit stairs, gently guide them away from their bags, and place them in the middle of your walking group.",
          ar: "استخدام إشارات يد واضحة تشير إلى مخرج الطوارئ، وتوجيهه برفق لترك الحقائب الثقيلة، ووضعه في منتصف مجموعة الموظفين أثناء الخروج."
        },
        correct: true
      },
      {
        id: "B",
        text: {
          en: "Tell them to wait inside the conference room with the door closed while you go look for a colleague who can speak their language to translate the instructions.",
          ar: "الطلب منه الانتظار داخل غرفة الاجتماعات مع إغلاق الباب ريثما تذهب للبحث عن زميل يتحدث لغته لترجمة تعليمات الإخلاء."
        },
        correct: false
      },
      {
        id: "C",
        text: {
          en: "Hand them a printed building safety leaflet, point toward the hallway door, and let them find their own way out to the parking area.",
          ar: "إعطاؤه خريطة السلامة المطبوعة من على الطاولة، والإشارة إلى باب الممر، وتركه يجد طريقه بمفرده نحو مواقف السيارات الخارجية."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Spot the Language Barrier", ar: "الخطوة 1: معرفة حاجز اللغة" },
        text: { en: "Understand that the visitor cannot follow loudspeaker voice messages and doesn't know the building.", ar: "إدراك أن الزائر لا يفهم الإعلانات الصوتية ولا يعرف مخارج المبنى." },
        icon: "search"
      },
      step2: {
        title: { en: "Step 2: Simple Hand Gestures", ar: "الخطوة 2: إشارات يد واضحة" },
        text: { en: "Wave toward the exit door and encourage them to leave heavy luggage behind immediately.", ar: "الإشارة بيدك باتجاه المخرج والتأكيد بلطف على ترك الحقائب الثقيلة." },
        icon: "hand"
      },
      step3: {
        title: { en: "Step 3: Keep Them in the Group", ar: "الخطوة 3: ضمه للمجموعة" },
        text: { en: "Walk them in the center of your group so they don't wander off or turn back into danger.", ar: "وضعه وسط الزملاء في طابور الخروج حتى لا يتشتت أو يعود إلى مناطق الخطر." },
        icon: "exit"
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
      en: "While checking the 2nd floor, you open the prayer room door and find five colleagues in the middle of prayer. The room door was shut so the alarm was quiet inside, but you can smell smoke coming through the air vents from the hallway.",
      ar: "أثناء تفقد الدور الثاني، فتحت باب المصلى ووجدت خمسة زملاء يؤدون الصلاة جماعة. كان الباب مغلقاً وصوت الإنذار منخفضاً بالداخل، لكنك تشم رائحة دخان بدأت تدخل عبر فتحات التكييف."
    },
    environment: {
      heat: { en: "Slightly Warm", ar: "دافئ قليلاً", status: "warm" },
      smoke: { en: "Smoke Smell from Vents", ar: "رائحة دخان من التكييف", status: "light" },
      people: { en: "5 Colleagues Praying", ar: "5 زملاء يؤدون الصلاة", },
      urgency: { en: "High - Life Safety First", ar: "عالية - سلامة الأرواح أولاً" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Stand quietly near the door and wait until they complete their prayer before letting them know about the evacuation alarm.",
          ar: "الوقوف بهدوء عند الباب والانتظار حتى يكمل الزملاء صلاتهم قبل إبلاغهم بإنذار الإخلاء."
        },
        correct: false
      },
      {
        id: "B",
        text: {
          en: "Enter immediately, announce in a loud and clear voice: 'Fire alarm - please evacuate now for your safety', ensure everyone exits, check the shoe rack area, and close the door behind you.",
          ar: "الدخول فوراً والتنبيه بصوت قوي وواضح: 'إنذار حريق - يرجى الإخلاء فوراً لسلامتكم'، والتأكد من خروج الجميع، وتفقد زاوية الأحذية، ثم إغلاق الباب خلفكم."
        },
        correct: true
      },
      {
        id: "C",
        text: {
          en: "Pull the fire extinguisher pin near the prayer room entrance and spray powder in the air to scare them into leaving quickly.",
          ar: "سحب مسمار الأمان من مطفأة الحريق ورش البودرة في الهواء عند المدخل لإثارة فزعهم ودفعهم للخروج السريع."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Life Safety Comes First", ar: "الخطوة 1: حفظ النفس أولاً" },
        text: { en: "Remember that human life and safety always take priority over finishing any ongoing activity or prayer.", ar: "تذكر دائماً أن حفظ النفس وسلامة الأرواح مقدمة على إكمال أي نشاط بما في ذلك الصلاة." },
        icon: "alert"
      },
      step2: {
        title: { en: "Step 2: Clear Loud Order", ar: "الخطوة 2: تنبيه صوتي حازم" },
        text: { en: "Speak firmly and clearly so everyone stops and moves toward the door without hesitation.", ar: "التحدث بنبرة قوية وواضحة ليسمعك الجميع ويتجهوا نحو المخرج فوراً دون تردد." },
        icon: "volume"
      },
      step3: {
        title: { en: "Step 3: Check Corners & Shut Door", ar: "الخطوة 3: تفقد الزوايا وإغلاق الباب" },
        text: { en: "Quickly scan shoe racks and wash corners to ensure zero occupants remain, then close the door to keep smoke out.", ar: "التأكد السريع من خلو أماكن الوضوء والأحذية ثم إغلاق الباب بإحكام لعزل الدخان." },
        icon: "exit"
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
      en: "While checking the restrooms, grey smoke is beginning to drift in from the ceiling. All stall doors are open and empty except one corner stall that is locked from the inside. Nobody answers when you call out normally.",
      ar: "أثناء تفقد دورات المياه، بدأ دخان رمادي يدخل من فتحات السقف. جميع الأبواب مفتوحة وفارغة باستثناء كابينة واحدة بالزاوية مغلقة من الداخل، ولا أحد يجيب عند النداء العادي."
    },
    environment: {
      heat: { en: "Getting Hot", ar: "حرارة متزايدة", status: "warm" },
      smoke: { en: "Grey Smoke Entering Room", ar: "دخان رمادي يتصاعد بالغرفة", status: "heavy" },
      people: { en: "Potential Person Inside Stall", ar: "احتمال وجود شخص بالداخل", },
      urgency: { en: "Urgent Check Required", ar: "فحص عاجل دون تعريض نفسك للخطر" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Bang firmly on the stall door, shout 'Emergency Evacuation - Answer now!', look under the door gap for feet, and if smoke thickens with no reply, mark room as Unchecked and tell the safety team outside.",
          ar: "الطق بقوة على باب الكابينة، والصراخ 'إخلاء طوارئ - أجب الآن!'، والنظر أسفل فتحة الباب لرؤية أي قدمين، وإذا زاد الدخان دون رد، تسجيل المكان وإبلاغ فريق الإطفاء بالخارج."
        },
        correct: true
      },
      {
        id: "B",
        text: {
          en: "Try to kick down the locked stall door using your shoes, ignoring the growing smoke that is starting to make breathing difficult.",
          ar: "محاولة ركل باب الكابينة وكسره بحذائك، متجاهلاً تزايد الدخان الذي بدأ يصعب عملية التنفس."
        },
        correct: false
      },
      {
        id: "C",
        text: {
          en: "Assume the lock was engaged by accident and the stall is empty, close the main restroom door, and continue walking to the next office wing.",
          ar: "الافتراض بأن القفل علق بالخطأ وأن الكابينة فارغة، وإغلاق باب الحمام الرئيسي ومتابعة المشي للجناح التالي."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Check Locked Stalls", ar: "الخطوة 1: التحقق من الأبواب المغلقة" },
        text: { en: "Never walk past a locked door without verifying if someone is inside or unable to respond.", ar: "عدم تجاهل أي كابينة مغلقة دون التأكد هل يوجد بداخلها شخص بحاجة لمساعدة." },
        icon: "search"
      },
      step2: {
        title: { en: "Step 2: Knock, Shout & Check Gap", ar: "الخطوة 2: طرق الباب والصراخ والنظر بالأسفل" },
        text: { en: "Bang loudly on the door, shout the evacuation order, and bend down to look for feet under the gap.", ar: "الطق بقوة، والصراخ بأمر الإخلاء، والنظر أسفل الباب للتأكد من وجود أقدام أو شخص ساقط." },
        icon: "hand"
      },
      step3: {
        title: { en: "Step 3: Escalate to Fire Team", ar: "الخطوة 3: الإبلاغ السريع لفريق الإنقاذ" },
        text: { en: "If heavy smoke threatens your own breathing, exit immediately and give the exact stall location to firefighters outside.", ar: "إذا هدد الدخان سلامتك، اخرج فوراً وأبلغ رجال الإطفاء المجهزين بالأقنعة بالموقع الدقيق." },
        icon: "exit"
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
      en: "While heading to the stairs, a colleague suddenly collapses onto the floor 10 meters in front of you. The hallway air is completely clean with no smoke, and right on the wall beside them is an Automated External Defibrillator (AED) medical box.",
      ar: "أثناء التوجه نحو الدرج، سقط زميل فجأة على الأرض على بعد 10 أمتار أمامك. هواء الممر نظيف تماماً وخالٍ من الدخان، ويوجد بجانبه مباشرة على الحائط جهاز الصدمات الكهربائية للقلب (AED)."
    },
    environment: {
      heat: { en: "Normal & Safe", ar: "حرارة طبيعية وآمنة", status: "normal" },
      smoke: { en: "Clean Air / No Smoke", ar: "هواء نقي تماماً / لا يوجد دخان", status: "none" },
      people: { en: "1 Unresponsive Colleague", ar: "زميل فاقد للوعي والتنفس", },
      urgency: { en: "Life Critical (3 Minutes Window)", ar: "حرج جداً (نافذة إنقاذ 3 دقائق)" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Check that the area is safe, check if they are breathing, start chest compressions (CPR), turn on the AED beside them, and ask another evacuee to call for emergency medical help.",
          ar: "التأكد من أمان المكان، وفحص التنفس، والبدء بالضغطات الصدرية (CPR)، وتشغيل جهاز AED الموجود بجانبه، والطلب من زميل مار استدعاء الإسعاف فوراً."
        },
        correct: true
      },
      {
        id: "B",
        text: {
          en: "Immediately grab them by their feet and drag them down three flights of stairs to the parking lot before checking if they are breathing or alive.",
          ar: "سحب المصاب من قدميه وسحله فوراً عبر 3 أدوار من الدرج لمواقف السيارات قبل فحص تنفسه أو نبضه."
        },
        correct: false
      },
      {
        id: "C",
        text: {
          en: "Roll them onto their side, cover them with an office jacket, and continue clearing offices alone without calling for medical help.",
          ar: "تعديل وضعيته على جنبه، وتغطيته بجاكيت، ومواصلة تفقد بقية المكاتب بمفردك دون طلب مساعدة طبية."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Check Air Safety", ar: "الخطوة 1: التأكد من أمان الهواء" },
        text: { en: "If the air is clean and free of smoke, you can safely deliver immediate medical help right there.", ar: "إذا كان الهواء نظيفاً وخالياً من الدخان، فالمكان آمن لتقديم الإسعافات الفورية في نفس الموقع." },
        icon: "search"
      },
      step2: {
        title: { en: "Step 2: Immediate CPR & AED", ar: "الخطوة 2: الإنعاش واستخدام جهاز AED" },
        text: { en: "Start chest compressions and follow the automated voice prompts of the AED within the first 3 critical minutes.", ar: "البدء بالضغطات الصدرية واتباع التعليمات الصوتية لجهاز AED خلال أول 3 دقائق لإنقاذ القلب." },
        icon: "heart"
      },
      step3: {
        title: { en: "Step 3: Call Medical Responders", ar: "الخطوة 3: طلب المسعفين وتوجيههم" },
        text: { en: "Direct a passing colleague to notify the emergency ambulance team outside with your exact hallway location.", ar: "توجيه زميل آخر لإبلاغ فريق الإسعاف بالخارج بموقعكم الدقيق في الممر لسرعة الوصول." },
        icon: "exit"
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
      en: "In a damaged storage room where an overhead concrete beam has collapsed, you discover an employee trapped with obvious fatal injuries that are impossible to survive. The ceiling around you is cracking and plaster is falling.",
      ar: "في مستودع الأرشيف حيث انهار عمود خرساني ثقيل، عثرت على شخص محتجز يعاني من إصابات بالغة جداً وواضحة لا تسمح بالحياة إطلاقاً. بدأ سقف الغرفة بالتصدع وتساقط الجبس من حولك."
    },
    environment: {
      heat: { en: "Very Hot", ar: "حرارة عالية جداً", status: "danger" },
      smoke: { en: "Dust & Heavy Smoke", ar: "غبار كثيف ودخان خانق", status: "heavy" },
      people: { en: "Fatal Trauma Victim", ar: "حالة وفاة مؤكدة", },
      urgency: { en: "Imminent Ceiling Collapse", ar: "خطر انهيار إضافي وشيك" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Spend 10 minutes trying to lift the heavy concrete beam by yourself to retrieve the body before leaving the room.",
          ar: "قضاء 10 دقائق في محاولة رفع العمود الخرساني الثقيل بمفردك لسحب الجثمان قبل الخروج من الغرفة."
        },
        correct: false
      },
      {
        id: "B",
        text: {
          en: "Do not delay the evacuation of living people; note the room number on your checklist, close the door, and report the exact location to the emergency leader outside.",
          ar: "عدم تأخير إخلاء الأحياء؛ تسجيل رقم الغرفة في ورقتك، وإغلاق الباب، وإبلاغ قائد الطوارئ بالخارج بالموقع الدقيق."
        },
        correct: true
      },
      {
        id: "C",
        text: {
          en: "Try to pull the body out by their arms and move them into the middle of the hallway before continuing your sweep.",
          ar: "محاولة سحب الجثمان بالقوة من ذراعيه ووضعه في منتصف الممر قبل متابعة تفقد بقية الغرف."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Check Survivability", ar: "الخطوة 1: التأكد من استحالة النجاة" },
        text: { en: "Recognize obvious fatal trauma quickly without taking reckless risks that could harm you or other staff.", ar: "إدراك حالات الوفاة المؤكدة بسرعة دون المخاطرة بحياتك تحت أسقف متصدعة." },
        icon: "alert"
      },
      step2: {
        title: { en: "Step 2: Prioritize the Living", ar: "الخطوة 2: حماية أرواح الأحياء" },
        text: { en: "Never risk your life or delay surviving colleagues to move someone who has already passed away.", ar: "عدم تعريض حياتك للخطر أو تأخير خروج زملائك الأحياء لنقل المتوفين." },
        icon: "user"
      },
      step3: {
        title: { en: "Step 3: Mark & Report Room", ar: "الخطوة 3: تسجيل الموقع وإبلاغ القيادة" },
        text: { en: "Close the door, write down the room number, and give the exact spot to emergency rescue teams outside.", ar: "إغلاق الباب وتسجيل رقم الغرفة بدقة وتسليمه لفرق الإنقاذ المتخصصة بالخارج." },
        icon: "exit"
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
      en: "You reach the fire exit stairs with an office colleague who uses a wheelchair. The building elevators have automatically turned off for fire safety. The stairwell landing is protected by heavy fire doors and the air inside the stairs is clean.",
      ar: "وصلت إلى مدخل درج الطوارئ برفقة زميل يستخدم كرسياً متحركاً. توقفت مصاعد المبنى تلقائياً لسلامة الحريق. بسطة الدرج محمية بأبواب حريق ثقيلة والهواء داخل بيت الدرج نظيف."
    },
    environment: {
      heat: { en: "Safe Inside Stairs", ar: "آمن داخل بيت الدرج", status: "normal" },
      smoke: { en: "Clean Air in Stairwell", ar: "هواء نظيف في الدرج", status: "none" },
      people: { en: "1 Wheelchair User", ar: "زميل من ذوي الإعاقة الحركية", },
      urgency: { en: "High - Cannot Use Normal Stairs", ar: "عالية - لا يمكنه النزول بمفرده" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Try using a maintenance key to force the passenger elevator back on so you can ride it down to the ground floor with the wheelchair.",
          ar: "محاولة تشغيل مصعد الركاب باستخدام مفتاح صيانة للنزول به وبالكرسي المتحرك إلى الدور الأرضي."
        },
        correct: false
      },
      {
        id: "B",
        text: {
          en: "Move colleague into the protected stairwell refuge area, assign 2 evacuation buddies to stay with them, and inform the emergency team outside of their exact floor location.",
          ar: "نقل الزميل إلى منطقة الملجأ المحمية داخل بيت الدرج، وتعيين 2 من المساعدين للبقاء معه، وإبلاغ فريق الطوارئ بالخارج بموقعه ورقم الدور بدقة."
        },
        correct: true
      },
      {
        id: "C",
        text: {
          en: "Ask four colleagues to manually lift the heavy motorized wheelchair and try carrying it down 6 flights of stairs while crowds are running down.",
          ar: "الطلب من أربعة موظفين حمل الكرسي المتحرك الكهربائي الثقيل ومحاولة النزول به عبر 6 أدوار وسط تدافع الناس على الدرج."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Never Use Elevators in Fires", ar: "الخطوة 1: ممنوع استخدام المصاعد تماماً" },
        text: { en: "Elevators can get stuck, lose power, or fill with smoke, and must never be used in a fire alarm.", ar: "المصاعد قد تتعطل فجأة أو تنقطع عنها الكهرباء أو تمتلئ بالدخان، ويحظر استخدامها تماماً في الحرائق." },
        icon: "alert"
      },
      step2: {
        title: { en: "Step 2: Use Protected Stair Refuge", ar: "الخطوة 2: استخدام ملجأ بيت الدرج المحمي" },
        text: { en: "Stairwell landings have fire-rated doors and fresh air, making them safe waiting areas.", ar: "بسطات الأدراج محمية بأبواب حريق عازلة ومقاومة للنيران، وهي أماكن انتظار آمنة ومخصصة لذلك." },
        icon: "shield"
      },
      step3: {
        title: { en: "Step 3: Assign Buddies & Report Floor", ar: "الخطوة 3: تعيين مساعدين وإبلاغ الفريق" },
        text: { en: "Leave two colleagues with them for safety and tell the rescue team outside to send an evacuation carry team.", ar: "إبقاء زميلين معه للدعم والمساعدة وإبلاغ فرق الإنقاذ بالخارج لإرسال كرسي إخلاء متخصص." },
        icon: "exit"
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
      en: "You check a side office and find a colleague with hearing loss wearing noise-cancelling headphones, typing with their back to the door. The visual flashing alarm light in their room has burned out, and they have no idea the building alarm has been ringing for 3 minutes.",
      ar: "أثناء تفقد المكاتب الجانبية، وجدت زميلاً يعاني من ضعف السمع يرتدي سماعات رأس عازلة وظهره للباب. مصباح الإنذار الضوئي في غرفته محترق ولا يعمل، ولا يعلم إطلاقاً بأن إنذار المبنى يدوي منذ 3 دقائق."
    },
    environment: {
      heat: { en: "Normal Office Air", ar: "هواء معتدل", status: "normal" },
      smoke: { en: "Light Smoke in Hallway Outside", ar: "دخان خفيف بالممر بالخارج", status: "light" },
      people: { en: "1 Unaware Colleague", ar: "موظف واحد لم ينتبه للإنذار", },
      urgency: { en: "Needs Direct Alert", ar: "يحتاج تنبيهاً مباشراً للخروج" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Flick room lights, use tactical flashlight visual wave, make direct eye contact, write 'EVACUATE' or gesture clearly, and lead out.",
          ar: "إضاءة وإطفاء أنوار الغرفة، استخدام الكشاف اليدوي، التواصل البصري المباشر، كتابة 'إخلاء' أو الإشارة بوضوح والمرافقة للخارج."
        },
        correct: true
      },
      {
        id: "B",
        text: {
          en: "Stand in the hallway doorway and shout as loud as you can, hoping your voice will cut through their headphones.",
          ar: "الوقوف عند عتبة الباب والصراخ بأعلى صوت، على أمل أن يخترق صوتك سماعات الرأس العازلة."
        },
        correct: false
      },
      {
        id: "C",
        text: {
          en: "Bang once on the glass door and walk away, assuming the vibration will eventually make them look up.",
          ar: "الطق مرة واحدة على زجاج الباب والمغادرة، بافتراض أن الاهتزاز سيجعله ينتبه بمفرده لاحقاً."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Notice Broken Strobe Light", ar: "الخطوة 1: ملاحظة تعطل المصباح الضوئي" },
        text: { en: "If the flashing visual alarm light fails, a person with hearing loss has no way to know an alarm is sounding.", ar: "عند تعطل مصباح الإنذار الضوئي، لا يملك من يعاني من ضعف السمع أي وسيلة لمعرفة وجود إنذار." },
        icon: "search"
      },
      step2: {
        title: { en: "Step 2: Use Light Switches & Eye Contact", ar: "الخطوة 2: وميض الإضاءة والتواصل البصري" },
        text: { en: "Flick the room lights and step in front of them so they can see you without being frightened.", ar: "إطفاء وإضاءة أنوار الغرفة والوقوف في مجال رؤيته حتى ينتبه بهدوء دون فزع مفاجئ." },
        icon: "light"
      },
      step3: {
        title: { en: "Step 3: Write 'EVACUATE' & Walk Together", ar: "الخطوة 3: كتابة كلمة 'إخلاء' والمرافقة" },
        text: { en: "Show a clear written note or phone screen reading 'FIRE ALARM - EVACUATE' and walk them out to the exit.", ar: "عرض ملاحظة مكتوبة بخط كبير 'إنذار حريق - إخلاء' ومرافقته للخروج مع الفريق." },
        icon: "exit"
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
      en: "Checking the final office before the exit, you see a small paper bin smoldering. But right behind the glass partition, a tall wall of computer servers is engulfed in floor-to-ceiling flames with thick black smoke pouring out and intense heat radiating through the glass.",
      ar: "أثناء تفقد آخر غرفة قبل المخرج، رأيت سلة أوراق صغيرة تحترق، ولكن خلف القاطع الزجاجي مباشرة تشتعل خزانة خوادم كبيرة بلهب يمتد من الأرض للسقف، مع دخان أسود كثيف وحرارة عالية جداً."
    },
    environment: {
      heat: { en: "Extreme Heat from Server Fire", ar: "حرارة شديدة جداً من حريق الخوادم", status: "danger" },
      smoke: { en: "Heavy Black Toxic Smoke", ar: "دخان أسود كثيف وسام", status: "heavy" },
      people: { en: "All Staff Already Cleared Ahead", ar: "جميع الموظفين خرجوا للأمام", },
      urgency: { en: "Immediate Danger - Exit Now", ar: "خطر فوري - اخرج فوراً" }
    },
    options: [
      {
        id: "A",
        text: {
          en: "Grab a small hand-held office fire extinguisher and go inside to try putting out the ceiling-high server flames.",
          ar: "أخذ مطفأة حريق يدوية صغيرة من الممر والدخول لمحاولة إطفاء نيران الخوادم الممتدة للسقف."
        },
        correct: false
      },
      {
        id: "B",
        text: {
          en: "Recognize the fire is too big for an office extinguisher, drop low under the smoke, close the door tightly to contain the fire, and flee through the exit.",
          ar: "إدراك أن الحريق كبير جداً ولا يمكن إطفاؤه بالمطفأة العادية، والنزول منخفضاً تحت الدخان، وإغلاق الباب بإحكام لعزل الحريق، والهروب فوراً عبر المخرج."
        },
        correct: true
      },
      {
        id: "C",
        text: {
          en: "Leave the office door wide open so the smoke can clear into the hallway, and look for an electrical switch.",
          ar: "ترك باب الغرفة مفتوحاً بالكامل لكي يخرج الدخان للممر، والبحث عن قاطع الكهرباء الرئيسي."
        },
        correct: false
      }
    ],
    actionSteps: {
      step1: {
        title: { en: "Step 1: Know Fire Extinguisher Limits", ar: "الخطوة 1: معرفة حدود مطفأة الحريق" },
        text: { en: "Office extinguishers are only made for tiny incipient fires like a wastebasket. Once flames reach the ceiling, you must never fight it.", ar: "طفايات المكاتب مخصصة فقط للحرائق الصغيرة جداً مثل سلة مهملات، وإذا امتدت النيران للسقف يحظر مكافحتها." },
        icon: "alert"
      },
      step2: {
        title: { en: "Step 2: Crawl Low Under Smoke", ar: "الخطوة 2: الزحف منخفضاً تحت الدخان" },
        text: { en: "Drop to your hands and knees where air is cooler and cleaner to avoid breathing toxic fumes.", ar: "النزول قريباً من الأرض حيث يكون الهواء أقل حرارة وخالياً من الغازات السامة لتسهيل التنفس." },
        icon: "shield"
      },
      step3: {
        title: { en: "Step 3: Close Fire Door & Flee", ar: "الخطوة 3: إغلاق الباب والهروب" },
        text: { en: "Firmly shut the fire door behind you to cut off oxygen and protect the exit corridor for other people.", ar: "إغلاق باب الحريق بإحكام لقطع الأكسجين عن النار وحماية ممر الخروج للجميع، ثم المغادرة فوراً." },
        icon: "exit"
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

  // Time & Penalties (Overall floor evacuation: 6:00 = 360s)
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
  }>>([]);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Countdown timer
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

  const smoothScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleStartDrill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !employeeId.trim()) {
      setValidationError(lang === 'en' ? 'Please enter both your Full Name and Employee ID.' : 'يرجى إدخال الاسم الكامل والرقم الوظيفي.');
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

    const actionSummary = `${currentSc.actionSteps.step1.title.en} -> ${currentSc.actionSteps.step2.title.en} -> ${currentSc.actionSteps.step3.title.en}`;

    setAnswersLog(prev => [
      ...prev,
      {
        scenarioId: currentSc.id,
        zoneId: currentSc.zoneId,
        selectedId: selectedOptId,
        correct: isCorrect,
        title: currentSc.title.en,
        actionSummary: actionSummary
      }
    ]);

    if (!isCorrect) {
      setPenaltySecondsAdded(prev => prev + 30);
      setPenaltiesCount(prev => prev + 1);
      setCountdownSeconds(prev => Math.max(0, prev - 30));
      setPenaltyFlash(true);
      setTimeout(() => setPenaltyFlash(false), 800);
    }

    // Smooth scroll to top immediately after submitting an answer
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
            particleCount: 80,
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

  // --- OFFICIAL AUDIT PDF GENERATION (STRICTLY ENGLISH & NO OVERLAPPING TEXT) ---
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const cleanId = (employeeId || 'WARDEN').replace(/[^a-zA-Z0-9-_]/g, '');
      const reportNumber = `KSIA-EVAC-${Date.now().toString().slice(-6)}-${cleanId}`;

      // Clean Page Background
      doc.setFillColor(15, 23, 42); // Dark Navy Slate #0f172a
      doc.rect(0, 0, 595.28, 841.89, 'F');

      // Top Hazard Border
      doc.setFillColor(250, 204, 21); // Yellow #facc15
      doc.rect(0, 0, 595.28, 6, 'F');

      // Outer Frame
      doc.setDrawColor(51, 65, 85);
      doc.setLineWidth(1);
      doc.rect(20, 20, 555.28, 801.89, 'S');

      // 1. Header Box (y: 24 to 90)
      doc.setFillColor(30, 41, 59);
      doc.rect(22, 22, 551.28, 68, 'F');

      doc.setTextColor(250, 204, 21);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text("KING SALMAN INTERNATIONAL AIRPORT (KSIA) - RIYADH", 36, 44);

      doc.setTextColor(241, 245, 249);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.text("ADMINISTRATION COMPLEX - OFFICE EVACUATION & ROOM SWEEP DRILL", 36, 60);

      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text("Official Employee Training & Egress Preparedness Audit Record", 36, 74);

      // Status Badge (Top Right)
      doc.setFillColor(isPassed ? 22 : 220, isPassed ? 163 : 38, isPassed ? 74 : 38);
      doc.roundedRect(430, 32, 130, 48, 4, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(isPassed ? "STATUS: PASSED" : "STATUS: RETEST", 442, 52);
      doc.setFontSize(8);
      doc.text(`SCORE: ${scorePercentage}% (${totalCorrect}/9)`, 442, 68);

      // 2. Employee Information Box (y: 98 to 156)
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
      doc.text(`Report ID: ${reportNumber}`, 310, 144);

      // 3. Performance Summary Box (y: 162 to 226)
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(32, 162, 531.28, 62, 3, 3, 'F');

      doc.setTextColor(250, 204, 21);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text("EVACUATION PERFORMANCE SUMMARY", 44, 178);

      const summaryCols = [
        { label: "Overall Score", val: `${scorePercentage}%`, sub: isPassed ? "PASSED (>= 80%)" : "NEEDS RETEST" },
        { label: "Drill Time", val: formatTime(rawElapsedSeconds), sub: "Total Seconds Active" },
        { label: "Hazard Delay Added", val: `+${penaltySecondsAdded}s`, sub: `${penaltiesCount} Wrong Choices` },
        { label: "Total Egress Time", val: formatTime(totalAdjustedTime), sub: countdownSeconds > 0 ? "Target Achieved" : "Time Exceeded" }
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

      // 4. Scenarios Table (y: 236 to 760) - Generously spaced, NO text overlaps
      doc.setTextColor(250, 204, 21);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text("DETAILED ROOM SWEEP DECISIONS & CORRECT ACTIONS", 36, 244);

      let curY = 254;
      SCENARIOS.forEach((sc, idx) => {
        const logItem = answersLog.find(a => a.scenarioId === sc.id);
        const correct = logItem ? logItem.correct : false;

        // Row Box
        doc.setFillColor(idx % 2 === 0 ? 30 : 22, idx % 2 === 0 ? 41 : 30, idx % 2 === 0 ? 59 : 45);
        doc.roundedRect(32, curY, 531.28, 50, 3, 3, 'F');

        // Status indicator bar
        doc.setFillColor(correct ? 22 : 220, correct ? 163 : 38, correct ? 74 : 38);
        doc.rect(32, curY, 4, 50, 'F');

        // Title Line (Scenario number + Office Title)
        doc.setTextColor(241, 245, 249);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`${sc.id}. ${sc.title.en} (${sc.department.en})`, 42, curY + 12);

        // Status Chip
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        if (correct) {
          doc.setTextColor(74, 222, 128);
          doc.text("CORRECT (0s penalty)", 450, curY + 12);
        } else {
          doc.setTextColor(248, 113, 113);
          doc.text("INCORRECT (+30s penalty)", 440, curY + 12);
        }

        // Action Steps Line
        doc.setTextColor(250, 204, 21);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        const stepSummary = `Key Protocol: 1. ${sc.actionSteps.step1.title.en} | 2. ${sc.actionSteps.step2.title.en} | 3. ${sc.actionSteps.step3.title.en}`;
        doc.text(stepSummary, 42, curY + 25);

        // Explanation / Life Safety Takeaway
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(6.8);
        const safeSummary = `Safety Takeaway: ${sc.explanation.en}`;
        const splitLines = doc.splitTextToSize(safeSummary, 500);
        doc.text(splitLines[0] || "", 42, curY + 37);
        if (splitLines[1]) {
          doc.text(splitLines[1], 42, curY + 46);
        }

        curY += 54;
      });

      // 5. Verification Sign-Off Footer (y: 752)
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(32, 750, 531.28, 40, 3, 3, 'F');

      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text("King Salman International Airport (KSIA) Administration Complex · Safety & Emergency Response", 44, 764);
      doc.text("This document records the employee's completion of the evacuation drill and room sweeping procedures.", 44, 775);
      doc.text(`Verification UID: ${reportNumber}`, 44, 785);

      // Save PDF
      doc.save(`KSIA_Evacuation_Report_${cleanId}.pdf`);
    } catch {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-sm shadow">
              ⚡
            </div>
            <div>
              <div className="font-extrabold text-sm md:text-base tracking-wide text-white uppercase flex items-center gap-1.5">
                KSIA Riyadh
                <span className="text-amber-400 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
                  SAFETY
                </span>
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block">
                {lang === 'en' ? 'King Salman International Airport · Administration Complex' : 'مطار الملك سلمان الدولي · مجمع الإدارة، الرياض'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 text-xs font-bold transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
        </div>

        {/* Live Toolbar during Drill */}
        {screen === 1 && (
          <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <div className="text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>{lang === 'en' ? `Room ${scenarioIdx + 1} of ${SCENARIOS.length}` : `الغرفة ${scenarioIdx + 1} من ${SCENARIOS.length}`}</span>
            </div>

            <div className={`px-2.5 py-1 rounded font-mono font-bold text-xs md:text-sm flex items-center gap-1.5 ${
              penaltyFlash ? 'bg-red-950 text-red-400 border border-red-500 penalty-pulse' :
              countdownSeconds < 60 ? 'bg-red-950/80 text-red-400 border border-red-600/60 animate-pulse' :
              'bg-slate-900 text-amber-400 border border-slate-700'
            }`}>
              <span>⏱ {formatTime(countdownSeconds)}</span>
              {penaltySecondsAdded > 0 && (
                <span className="text-[10px] text-red-400 font-normal">
                  (+{penaltySecondsAdded}s penalty)
                </span>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 md:py-8">

        {/* ================= SCREEN 0: REGISTRATION ================= */}
        {screen === 0 && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-xl">
              <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                King Salman International Airport · Administration Complex
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
                {lang === 'en' ? 'Office Evacuation & Room Sweeping Drill' : 'تمرين إخلاء المكاتب ومسح الغرف'}
              </h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl">
                {lang === 'en'
                  ? 'Interactive emergency preparedness training for office staff. Practice making the right decisions room by room during an office evacuation. Passing score is 80% or higher.'
                  : 'تدريب تفاعلي للسلامة وإخلاء المكاتب لموظفي الإدارة. تدرب على اتخاذ القرارات الصحيحة غرفة بغرفة أثناء الإخلاء. نسبة النجاح 80% أو أعلى.'
                }
              </p>

              {/* 4 Clear Rules for Office Staff */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/80 flex items-start gap-2.5">
                  <span className="text-amber-400 text-lg">⏱️</span>
                  <div>
                    <div className="text-xs font-bold text-slate-100">{lang === 'en' ? 'Floor Timer' : 'مؤقت إخلاء الدور'}</div>
                    <div className="text-[11px] text-slate-400">{lang === 'en' ? '6:00 minutes (360 seconds) to check all office zones.' : 'مؤقت 6:00 دقائق (360 ثانية) للتحقق من جميع أقسام الدور.'}</div>
                  </div>
                </div>

                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/80 flex items-start gap-2.5">
                  <span className="text-red-400 text-lg">⚠️</span>
                  <div>
                    <div className="text-xs font-bold text-slate-100">{lang === 'en' ? '+30s Delay Penalty' : 'عقوبة تأخير (+30 ثانية)'}</div>
                    <div className="text-[11px] text-slate-400">{lang === 'en' ? 'Incorrect answers add a 30-second delay to your time.' : 'الإجابة الخاطئة تضيف تأخيراً 30 ثانية لتوقيت إخلائك.'}</div>
                  </div>
                </div>

                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/80 flex items-start gap-2.5">
                  <span className="text-emerald-400 text-lg">🎯</span>
                  <div>
                    <div className="text-xs font-bold text-slate-100">{lang === 'en' ? 'Passing Grade' : 'درجة الاجتياز'}</div>
                    <div className="text-[11px] text-slate-400">{lang === 'en' ? 'Requires 80% or higher. Retake anytime to get 100%.' : 'يتطلب 80% فأعلى. يمكنك الإعادة في أي وقت للحصول على 100%.'}</div>
                  </div>
                </div>

                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/80 flex items-start gap-2.5">
                  <span className="text-blue-400 text-lg">📥</span>
                  <div>
                    <div className="text-xs font-bold text-slate-100">{lang === 'en' ? 'Downloadable Report' : 'تقرير تدريب قابل للتحميل'}</div>
                    <div className="text-[11px] text-slate-400">{lang === 'en' ? 'Save your official evacuation report at the end.' : 'احفظ تقرير الإخلاء الرسمي عند الانتهاء.'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleStartDrill} className="bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-xl space-y-4">
              <div className="border-b border-slate-700 pb-3">
                <h2 className="text-lg font-bold text-white">
                  {lang === 'en' ? 'Employee Information' : 'بيانات الموظف'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'en' ? 'Please fill in your details before starting the drill.' : 'يرجى إدخال بياناتك قبل بدء التدريب.'}
                </p>
              </div>

              {validationError && (
                <div className="p-3 rounded-lg bg-red-950/80 border border-red-500 text-red-200 text-xs">
                  {validationError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-200 uppercase">
                    {lang === 'en' ? 'Full Name' : 'الاسم الكامل'} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Tariq Al-Ghamdi' : 'مثال: طارق الغامدي'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-200 uppercase">
                    {lang === 'en' ? 'Employee ID' : 'الرقم الوظيفي'} <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. KSIA-4821"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-200 uppercase">
                    {lang === 'en' ? 'Training Date' : 'تاريخ التدريب'}
                  </label>
                  <input
                    type="date"
                    value={assessmentDate}
                    onChange={(e) => setAssessmentDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99] shadow-lg shadow-amber-400/20"
              >
                <span>{lang === 'en' ? 'Start Evacuation Drill' : 'بدء تمرين الإخلاء'}</span>
                <span>➔</span>
              </button>
            </form>
          </div>
        )}

        {/* ================= SCREEN 1: DRILL ENGINE ================= */}
        {screen === 1 && (
          <div className="space-y-5">
            
            {/* Zone Status Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 md:p-5 shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentZone.icon}</span>
                  <div>
                    <span className="text-[11px] text-amber-400 font-bold uppercase block">
                      {currentZone.code} · {currentZone.name[lang]}
                    </span>
                    <h2 className="text-base md:text-lg font-bold text-white">
                      {currentSc.title[lang]}
                    </h2>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-400">
                  {scenarioIdx + 1} / {SCENARIOS.length}
                </div>
              </div>

              {/* Progress Steps Indicator */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {ZONES_LIST.map((zone) => {
                  const isCurrent = zone.id === currentSc.zoneId;
                  const isPast = SCENARIOS.findIndex(s => s.zoneId === zone.id) < scenarioIdx;
                  return (
                    <div 
                      key={zone.id}
                      className={`h-2 rounded-full transition-all ${
                        isCurrent 
                          ? 'bg-amber-400 ring-2 ring-amber-400/30' 
                          : isPast 
                          ? 'bg-emerald-500' 
                          : 'bg-slate-950 border border-slate-700'
                      }`}
                      title={zone.name[lang]}
                    />
                  );
                })}
              </div>
            </div>

            {/* Scenario Card */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 md:p-7 shadow-xl space-y-5">
              
              {/* Simple Room Environment Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-700/80">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">🌡️ {lang === 'en' ? 'Heat' : 'الحرارة'}</div>
                  <div className={`font-bold mt-0.5 ${currentSc.environment.heat.status === 'danger' ? 'text-red-400' : currentSc.environment.heat.status === 'warm' ? 'text-amber-400' : 'text-slate-200'}`}>
                    {currentSc.environment.heat[lang]}
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-700/80">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">🌫️ {lang === 'en' ? 'Smoke' : 'الدخان'}</div>
                  <div className={`font-bold mt-0.5 ${currentSc.environment.smoke.status === 'heavy' ? 'text-red-400' : currentSc.environment.smoke.status === 'light' ? 'text-amber-400' : 'text-slate-200'}`}>
                    {currentSc.environment.smoke[lang]}
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-700/80">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">👥 {lang === 'en' ? 'People' : 'الأشخاص'}</div>
                  <div className="font-bold text-slate-200 mt-0.5">
                    {currentSc.environment.people[lang]}
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-700/80">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">⚠️ {lang === 'en' ? 'Urgency' : 'الأهمية'}</div>
                  <div className="font-bold text-amber-300 mt-0.5">
                    {currentSc.environment.urgency[lang]}
                  </div>
                </div>
              </div>

              {/* Office Situation Prompt */}
              <div className="bg-slate-950/90 rounded-xl p-4 md:p-5 border border-slate-700/80">
                <div className="text-[11px] text-amber-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>📍 {currentSc.department[lang]}</span>
                  <span className="text-slate-400 font-normal">{lang === 'en' ? 'What you see in this room:' : 'ما تراه في هذه الغرفة:'}</span>
                </div>
                <p className="text-sm md:text-base text-slate-100 font-medium leading-relaxed mt-2">
                  {currentSc.description[lang]}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {lang === 'en' ? 'What is the best action to take?' : 'ما هو التصرف الصحيح؟'}
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
                      className={`w-full text-start p-4 rounded-xl border text-sm md:text-base leading-relaxed flex items-start gap-3.5 transition-all cursor-pointer ${optClass}`}
                    >
                      <span className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs font-mono ${
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

              {/* Confirm Button */}
              {!isAnswerSubmitted && (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={!selectedOptId}
                    onClick={handleSubmitAnswer}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      selectedOptId
                        ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 active:scale-[0.99]"
                        : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                    }`}
                  >
                    <span>{lang === 'en' ? 'Confirm Choice' : 'تأكيد الاختيار'}</span>
                    <span>➔</span>
                  </button>
                </div>
              )}

              {/* Visual Action Steps & Clear Explanation */}
              {isAnswerSubmitted && (
                <div className="space-y-4 pt-2">
                  
                  {/* Result Banner */}
                  {lastCorrect ? (
                    <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-100 text-sm">
                      <div className="font-bold text-emerald-300 flex items-center gap-2 mb-1">
                        <span>✅</span>
                        <span>{lang === 'en' ? 'Great Decision! That is the correct procedure.' : 'تصرف سليم جداً! هذا هو الإجراء الصحيح.'}</span>
                      </div>
                      <p className="text-xs text-emerald-200 leading-relaxed">
                        {currentSc.explanation[lang]}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-red-950/90 border border-red-500 text-red-100 text-sm penalty-pulse">
                      <div className="font-bold text-red-300 flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2">
                          <span>⚠️</span>
                          <span>{lang === 'en' ? 'Hazard Delay: Incorrect Choice' : 'تنبيه: تصرف غير سليم'}</span>
                        </span>
                        <span className="text-[11px] font-mono bg-red-900 text-red-200 px-2 py-0.5 rounded border border-red-500">
                          +30s {lang === 'en' ? 'Delay' : 'تأخير'}
                        </span>
                      </div>
                      <p className="text-xs text-red-200 leading-relaxed">
                        {currentSc.explanation[lang]}
                      </p>
                    </div>
                  )}

                  {/* 3 Step Visual Action Card (Illustrated with clean SVGs) */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-amber-400/30 space-y-3">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                      <span>{lang === 'en' ? 'Correct 3-Step Procedure for this Room:' : 'خطوات التصرف الصحيحة الثلاث في هذه الغرفة:'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">1 ➔ 2 ➔ 3</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      {/* Step 1 */}
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs font-bold font-mono">
                            1
                          </div>
                          <span className="font-bold text-amber-300 text-xs">
                            {currentSc.actionSteps.step1.title[lang]}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {currentSc.actionSteps.step1.text[lang]}
                        </p>
                      </div>

                      {/* Step 2 */}
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs font-bold font-mono">
                            2
                          </div>
                          <span className="font-bold text-amber-300 text-xs">
                            {currentSc.actionSteps.step2.title[lang]}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {currentSc.actionSteps.step2.text[lang]}
                        </p>
                      </div>

                      {/* Step 3 */}
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-amber-400/10 text-amber-400 flex items-center justify-center text-xs font-bold font-mono">
                            3
                          </div>
                          <span className="font-bold text-amber-300 text-xs">
                            {currentSc.actionSteps.step3.title[lang]}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {currentSc.actionSteps.step3.text[lang]}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <button
                    type="button"
                    onClick={handleNextScenario}
                    className="w-full py-4 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99] shadow-lg shadow-amber-400/20"
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
          <div className="space-y-6">

            {/* Results Header */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-xl text-center space-y-3">
              <div className="inline-block p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-2xl mb-1">
                🛡️
              </div>

              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  King Salman International Airport · Administration Complex
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Office Evacuation & Room Sweeping Report
                </h1>
              </div>

              {/* Status Badge */}
              <div className="pt-2">
                <div className={`inline-block px-5 py-2.5 rounded-xl font-black text-sm tracking-widest uppercase border ${
                  isPassed 
                    ? "bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-500/10" 
                    : "bg-red-950/90 text-red-300 border-red-500 shadow-lg shadow-red-500/10"
                }`}>
                  {isPassed ? "EVACUATION DRILL PASSED (>= 80%)" : "NEEDS RETEST (BELOW 80%)"}
                </div>

                {isPerfectRun && (
                  <div className="mt-2 text-xs font-bold text-amber-400 tracking-wider">
                    🌟 PERFECT DRILL RUN (ZERO MISTAKES)
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                {isPassed
                  ? "Congratulations! You have demonstrated good emergency awareness and life-safety procedures for your office floor."
                  : "Please review the safety guidelines and retake the drill to ensure you are ready to help your colleagues safely."}
              </p>
            </div>

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Your Score</div>
                <div className={`text-2xl font-black font-mono mt-1 ${isPassed ? "text-emerald-400" : "text-red-400"}`}>
                  {scorePercentage}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{totalCorrect} of {SCENARIOS.length} Correct</div>
              </div>

              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Drill Time</div>
                <div className="text-2xl font-black font-mono text-slate-100 mt-1">
                  {formatTime(rawElapsedSeconds)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Time Active</div>
              </div>

              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Penalty Added</div>
                <div className={`text-2xl font-black font-mono mt-1 ${penaltiesCount > 0 ? "text-red-400" : "text-emerald-400"}`}>
                  +{penaltySecondsAdded}s
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{penaltiesCount} Wrong Answers</div>
              </div>

              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Time</div>
                <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                  {formatTime(totalAdjustedTime)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{countdownSeconds > 0 ? "Within 6:00 min" : "Exceeded 6:00 min"}</div>
              </div>
            </div>

            {/* 📥 BLEEPING YELLOW PDF DOWNLOAD CALL TO ACTION */}
            {/* Clean black arrow only, updated legend banner */}
            <div className="bg-slate-800/90 rounded-2xl border-2 border-amber-400/40 p-6 md:p-8 shadow-2xl text-center space-y-4">
              <div className="text-amber-300 font-bold text-sm md:text-base">
                {lang === 'en' 
                  ? "Remember to download your report and share it in your team group!" 
                  : "تذكر تحميل تقريرك ومشاركته في مجموعة فريق عملك!"}
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="bleeping-yellow-btn py-4 px-8 rounded-xl text-slate-950 font-black text-base md:text-lg tracking-wide flex items-center justify-center gap-3 transition-transform active:scale-95 cursor-pointer shadow-xl"
                >
                  {/* Clean Black Download Arrow Icon */}
                  <svg 
                    className="w-5 h-5 text-slate-950" 
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

              <div className="text-[11px] font-mono text-slate-400">
                Target File: <span className="text-amber-300 font-bold">KSIA_Evacuation_Report_{(employeeId || 'WARDEN').replace(/[^a-zA-Z0-9-_]/g, '')}.pdf</span>
              </div>
            </div>

            {/* ON-SCREEN AUDIT REPORT: NO OVERLAPPING TEXT, CLEAN & SPACIOUS */}
            <div ref={reportRef} className="bg-slate-850 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-xl space-y-6">
              
              <div className="border-b border-slate-700 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-mono text-amber-400 font-bold uppercase">
                      Office Safety Evacuation Record
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      Scenario-by-Scenario Evaluation Summary
                    </h3>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Date: {assessmentDate}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono mt-3 text-slate-300">
                  <div>Employee: <span className="text-white font-bold">{fullName.toUpperCase()}</span></div>
                  <div>ID: <span className="text-white font-bold">{employeeId}</span></div>
                  <div>Score: <span className="text-white font-bold">{scorePercentage}%</span></div>
                  <div>Result: <span className={isPassed ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{isPassed ? "PASSED" : "RETEST"}</span></div>
                </div>
              </div>

              {/* Review Rows */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Review of All 9 Office Rooms (Zones 1 to 5):
                </div>

                {SCENARIOS.map((sc, index) => {
                  const logItem = answersLog.find(a => a.scenarioId === sc.id);
                  const isOpt = logItem ? logItem.correct : false;

                  return (
                    <div 
                      key={sc.id} 
                      className={`p-4 rounded-xl border text-xs md:text-sm space-y-2.5 ${
                        isOpt 
                          ? "bg-slate-900/90 border-slate-700/80 text-slate-200" 
                          : "bg-red-950/20 border-red-500/40 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">
                          {index + 1}. {sc.title.en}
                        </span>
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          isOpt 
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40" 
                            : "bg-red-950 text-red-400 border border-red-500/40"
                        }`}>
                          {isOpt ? "CORRECT (+0s)" : "INCORRECT (+30s)"}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Department: {sc.department.en} · Your Answer: Option {logItem ? logItem.selectedId : 'N/A'}
                      </div>

                      {/* 3 Steps Summary */}
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-amber-300 space-y-1">
                        <div><strong>1.</strong> {sc.actionSteps.step1.title.en} — {sc.actionSteps.step1.text.en}</div>
                        <div><strong>2.</strong> {sc.actionSteps.step2.title.en} — {sc.actionSteps.step2.text.en}</div>
                        <div><strong>3.</strong> {sc.actionSteps.step3.title.en} — {sc.actionSteps.step3.text.en}</div>
                      </div>

                      <div className="text-[11px] text-slate-300 leading-relaxed">
                        <strong className="text-slate-200">Why this matters:</strong> {sc.explanation.en}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Retake Drill */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRestart}
                className="w-full py-4 px-6 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-sm tracking-wide border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
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
