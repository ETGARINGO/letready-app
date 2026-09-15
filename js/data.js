/* =========================================================
   LETReady — Content layer
   Question bank, lesson notes and flashcards.
   Edit this file to add your own items; nothing else needs to change.
   ========================================================= */
(function (global) {
  "use strict";

  const SUBJECTS = {
    gened:  { key: "gened",  name: "General Education",      short: "Gen Ed",  icon: "📘", weight: 40 },
    profed: { key: "profed", name: "Professional Education", short: "Prof Ed", icon: "🧠", weight: 40 },
    major:  { key: "major",  name: "Specialization",         short: "Major",   icon: "🎓", weight: 20 }
  };

  const TOPICS = {
    gened: ["English Language", "Mathematics", "Science", "Filipino", "Social Sciences"],
    profed: ["Learner Development", "Facilitating Learning", "Assessment of Learning",
             "Curriculum Development", "Teaching Profession", "Educational Technology"],
    major: ["Content Knowledge", "Instructional Planning", "Classroom Management"]
  };

  /* ---------- Question bank ---------- */
  const QUESTIONS = [
    /* ===== PROFESSIONAL EDUCATION ===== */
    { id: "pe01", subject: "profed", topic: "Assessment of Learning", difficulty: "Medium",
      question: "Which type of assessment is used during instruction to monitor learning and give feedback?",
      choices: ["Summative assessment", "Formative assessment", "Placement assessment", "Norm-referenced assessment"],
      answer: 1,
      explanation: "Formative assessment happens while instruction is ongoing. Its purpose is feedback and adjustment, not grading. Summative assessment evaluates learning after instruction ends." },

    { id: "pe02", subject: "profed", topic: "Facilitating Learning", difficulty: "Easy",
      question: "Which learning theory holds that learners actively construct knowledge through experience?",
      choices: ["Behaviorism", "Essentialism", "Constructivism", "Perennialism"],
      answer: 2,
      explanation: "Constructivism says learners build understanding by connecting experience and reflection, rather than passively absorbing transmitted information." },

    { id: "pe03", subject: "profed", topic: "Learner Development", difficulty: "Medium",
      question: "Which principle states that learners differ in ability, interest and readiness?",
      choices: ["Individual differences", "Uniformity principle", "Standardization", "Isolation principle"],
      answer: 0,
      explanation: "The principle of individual differences is the basis of differentiated instruction: each learner has a distinct pace, interest and readiness level." },

    { id: "pe04", subject: "profed", topic: "Facilitating Learning", difficulty: "Easy",
      question: "Which approach asks students to connect new information with what they already know?",
      choices: ["Passive learning", "Meaningful learning", "Mechanical repetition", "Rote memorization"],
      answer: 1,
      explanation: "Ausubel's meaningful learning anchors new concepts to existing cognitive structure, which produces far better retention than rote memorization." },

    { id: "pe05", subject: "profed", topic: "Assessment of Learning", difficulty: "Hard",
      question: "A test consistently yields the same scores when repeated under similar conditions. Which quality does it have?",
      choices: ["Validity", "Reliability", "Practicality", "Objectivity"],
      answer: 1,
      explanation: "Reliability is consistency of measurement. Validity is a different quality: whether the test measures what it claims to measure." },

    { id: "pe06", subject: "profed", topic: "Curriculum Development", difficulty: "Medium",
      question: "Which curriculum is the one the teacher actually delivers in the classroom?",
      choices: ["Written curriculum", "Taught curriculum", "Tested curriculum", "Recommended curriculum"],
      answer: 1,
      explanation: "The taught curriculum is what is actually implemented, which often differs from the written or recommended curriculum prepared by experts." },

    { id: "pe07", subject: "profed", topic: "Teaching Profession", difficulty: "Easy",
      question: "Under the Code of Ethics for Professional Teachers, a teacher's foremost obligation is to whom?",
      choices: ["School administration", "The learners", "The Department of Education", "Fellow teachers"],
      answer: 1,
      explanation: "The Code places the learner at the center of professional duty. The growth, welfare and safety of students guide every other obligation." },

    { id: "pe08", subject: "profed", topic: "Educational Technology", difficulty: "Medium",
      question: "What does the TPACK framework describe?",
      choices: ["A classroom seating plan", "The intersection of technology, pedagogy and content knowledge", "A grading rubric", "A behavior management system"],
      answer: 1,
      explanation: "TPACK argues that effective technology integration requires all three knowledge domains together, not technology skill on its own." },

    { id: "pe09", subject: "profed", topic: "Learner Development", difficulty: "Medium",
      question: "In Piaget's theory, a child who can reason about hypothetical situations has reached which stage?",
      choices: ["Sensorimotor", "Preoperational", "Concrete operational", "Formal operational"],
      answer: 3,
      explanation: "Formal operational thinking, beginning around age 11, allows abstract and hypothetical reasoning. Concrete operational learners still need tangible referents." },

    { id: "pe10", subject: "profed", topic: "Facilitating Learning", difficulty: "Medium",
      question: "Vygotsky's zone of proximal development refers to what a learner can do:",
      choices: ["Alone without help", "Only after graduation", "With guidance from a more capable other", "Only through punishment"],
      answer: 2,
      explanation: "The ZPD is the gap between independent performance and assisted performance. Scaffolding operates inside this zone and is gradually withdrawn." },

    { id: "pe11", subject: "profed", topic: "Assessment of Learning", difficulty: "Medium",
      question: "A teacher ranks students against each other rather than against a standard. This is:",
      choices: ["Criterion-referenced", "Norm-referenced", "Ipsative", "Authentic"],
      answer: 1,
      explanation: "Norm-referenced interpretation compares a learner to the group. Criterion-referenced interpretation compares performance to a fixed standard of mastery." },

    { id: "pe12", subject: "profed", topic: "Curriculum Development", difficulty: "Hard",
      question: "Which curriculum design organizes content around real-life problems across subjects?",
      choices: ["Subject-centered", "Learner-centered", "Problem-centered", "Discipline-based"],
      answer: 2,
      explanation: "Problem-centered design integrates disciplines around authentic issues, so learning is organized by the problem rather than by subject boundaries." },

    { id: "pe13", subject: "profed", topic: "Teaching Profession", difficulty: "Medium",
      question: "Republic Act 7836 is known as which law?",
      choices: ["Magna Carta for Public School Teachers", "Philippine Teachers Professionalization Act", "Governance of Basic Education Act", "Enhanced Basic Education Act"],
      answer: 1,
      explanation: "RA 7836 professionalized teaching and established licensure through the LET. RA 4670 is the Magna Carta, RA 9155 covers governance, RA 10533 is K to 12." },

    { id: "pe14", subject: "profed", topic: "Educational Technology", difficulty: "Easy",
      question: "According to Dale's Cone of Experience, which activity leads to the most lasting learning?",
      choices: ["Reading text", "Hearing a lecture", "Watching a demonstration", "Doing the real thing"],
      answer: 3,
      explanation: "Dale placed direct purposeful experience at the base of the cone. Concrete, participatory activity is retained longer than abstract, verbal input." },

    { id: "pe15", subject: "profed", topic: "Learner Development", difficulty: "Hard",
      question: "In Erikson's theory, the central crisis of adolescence is:",
      choices: ["Trust vs mistrust", "Industry vs inferiority", "Identity vs role confusion", "Intimacy vs isolation"],
      answer: 2,
      explanation: "Adolescents work to form a coherent sense of self. Industry vs inferiority belongs to school age, intimacy vs isolation to young adulthood." },

    { id: "pe16", subject: "profed", topic: "Assessment of Learning", difficulty: "Medium",
      question: "Which is the best example of authentic assessment?",
      choices: ["A 50-item multiple choice quiz", "Students design and present a community survey", "A spelling drill", "A true-or-false test"],
      answer: 1,
      explanation: "Authentic assessment asks students to perform a realistic task that mirrors work done outside the classroom, and it is judged with criteria or a rubric." },

    { id: "pe17", subject: "profed", topic: "Facilitating Learning", difficulty: "Easy",
      question: "Giving a student a star after good behavior to increase that behavior is:",
      choices: ["Negative reinforcement", "Positive reinforcement", "Punishment", "Extinction"],
      answer: 1,
      explanation: "Positive reinforcement adds a desirable stimulus to strengthen behavior. Negative reinforcement removes an unpleasant one to achieve the same effect." },

    { id: "pe18", subject: "profed", topic: "Curriculum Development", difficulty: "Medium",
      question: "The hidden curriculum refers to:",
      choices: ["Topics removed from the syllabus", "Unplanned values and norms students absorb in school", "Remedial lessons after class", "Confidential test materials"],
      answer: 1,
      explanation: "The hidden curriculum is the unwritten lessons about behavior, values and social roles that students learn from school routines and culture." },

    { id: "pe19", subject: "profed", topic: "Teaching Profession", difficulty: "Medium",
      question: "A teacher who continues graduate study and joins trainings demonstrates:",
      choices: ["Professional stagnation", "Lifelong learning", "Academic freedom", "Tenure security"],
      answer: 1,
      explanation: "Continuing professional development is both an ethical expectation and a licensure requirement for Philippine professional teachers." },

    { id: "pe20", subject: "profed", topic: "Educational Technology", difficulty: "Hard",
      question: "Which use of a classroom tablet best reflects higher-order technology integration?",
      choices: ["Students read a digital copy of the textbook", "Students watch a video the teacher selected", "Students produce a documentary defending a local policy", "Students answer drill exercises on an app"],
      answer: 2,
      explanation: "Producing an argued documentary requires analysis, evaluation and creation. The other options replace print with a screen without changing the thinking demanded." },

    /* ===== GENERAL EDUCATION ===== */
    { id: "ge01", subject: "gened", topic: "English Language", difficulty: "Easy",
      question: "Which sentence uses subject-verb agreement correctly?",
      choices: ["The list of items are on the table.", "The list of items is on the table.", "The list of items were on the table.", "The list of items be on the table."],
      answer: 1,
      explanation: "The head noun is 'list', which is singular, so the verb is 'is'. The plural noun inside the prepositional phrase does not control the verb." },

    { id: "ge02", subject: "gened", topic: "Mathematics", difficulty: "Easy",
      question: "What is 3/4 expressed as a percentage?",
      choices: ["34%", "75%", "43%", "134%"],
      answer: 1,
      explanation: "3 ÷ 4 = 0.75, and 0.75 × 100 = 75%." },

    { id: "ge03", subject: "gened", topic: "Science", difficulty: "Easy",
      question: "Which organelle produces most of the cell's usable energy?",
      choices: ["Nucleus", "Ribosome", "Mitochondrion", "Golgi apparatus"],
      answer: 2,
      explanation: "The mitochondrion carries out cellular respiration and generates ATP, the cell's energy currency." },

    { id: "ge04", subject: "gened", topic: "Filipino", difficulty: "Medium",
      question: "Alin ang wastong gamit ng pang-uri sa pangungusap?",
      choices: ["Siya ay tumakbo mabilis.", "Siya ay mabilis na tumakbo.", "Siya mabilis tumakbo.", "Siya ay tumakbo ng mabilis."],
      answer: 1,
      explanation: "Kailangan ng pang-angkop na 'na' sa pagitan ng panuring at pandiwa upang maging wasto ang pagkakabuo ng pangungusap." },

    { id: "ge05", subject: "gened", topic: "Social Sciences", difficulty: "Medium",
      question: "Which branch of Philippine government interprets the law?",
      choices: ["Executive", "Legislative", "Judiciary", "Constitutional commissions"],
      answer: 2,
      explanation: "The Judiciary interprets laws and settles controversies. Congress makes the law and the Executive implements it." },

    { id: "ge06", subject: "gened", topic: "Mathematics", difficulty: "Hard",
      question: "A class of 40 has a boy-to-girl ratio of 3:5. How many girls are there?",
      choices: ["15", "20", "24", "25"],
      answer: 3,
      explanation: "The ratio has 8 parts. 40 ÷ 8 = 5 learners per part, so girls = 5 parts × 5 = 25." },

    { id: "ge07", subject: "gened", topic: "English Language", difficulty: "Medium",
      question: "Choose the sentence with correct parallel structure.",
      choices: ["She likes reading, to jog, and swimming.", "She likes reading, jogging, and swimming.", "She likes to read, jogging, and to swim.", "She likes read, jog, and swimming."],
      answer: 1,
      explanation: "Items in a series must share the same grammatical form. Here all three are gerunds." },

    { id: "ge08", subject: "gened", topic: "Mathematics", difficulty: "Medium",
      question: "If a shirt marked ₱800 is sold at a 15% discount, what is the selling price?",
      choices: ["₱680", "₱700", "₱720", "₱785"],
      answer: 0,
      explanation: "15% of 800 is 120, so 800 − 120 = ₱680. You can also compute 800 × 0.85 directly." },

    { id: "ge09", subject: "gened", topic: "Science", difficulty: "Medium",
      question: "Which process do green plants use to convert light energy into chemical energy?",
      choices: ["Respiration", "Photosynthesis", "Transpiration", "Fermentation"],
      answer: 1,
      explanation: "Photosynthesis uses light, carbon dioxide and water to produce glucose and oxygen in the chloroplasts." },

    { id: "ge10", subject: "gened", topic: "Filipino", difficulty: "Easy",
      question: "Ano ang tawag sa salitang may magkatulad na kahulugan?",
      choices: ["Kasingkahulugan", "Kasalungat", "Kahulugan", "Katuturan"],
      answer: 0,
      explanation: "Ang kasingkahulugan o sinonimo ay salitang magkatulad ang ibig sabihin, halimbawa 'masaya' at 'maligaya'." },

    { id: "ge11", subject: "gened", topic: "Social Sciences", difficulty: "Medium",
      question: "The 1987 Philippine Constitution declares that sovereignty resides in:",
      choices: ["The President", "Congress", "The people", "The Supreme Court"],
      answer: 2,
      explanation: "Article II, Section 1 states that sovereignty resides in the people and all government authority emanates from them." },

    { id: "ge12", subject: "gened", topic: "Science", difficulty: "Hard",
      question: "Which is the correct order of decreasing wavelength?",
      choices: ["Gamma, X-ray, visible, radio", "Radio, visible, X-ray, gamma", "Visible, radio, gamma, X-ray", "X-ray, gamma, radio, visible"],
      answer: 1,
      explanation: "Radio waves have the longest wavelength and gamma rays the shortest, so decreasing wavelength runs radio → visible → X-ray → gamma." },

    { id: "ge13", subject: "gened", topic: "English Language", difficulty: "Hard",
      question: "In 'The committee has reached its decision,' the pronoun 'its' is correct because:",
      choices: ["Committee is plural", "Committee acts as one unit here", "Possessives are always singular", "Its is an abbreviation"],
      answer: 1,
      explanation: "A collective noun takes a singular pronoun when the group acts as a single body, and a plural pronoun when members act individually." },

    { id: "ge14", subject: "gened", topic: "Mathematics", difficulty: "Easy",
      question: "What is the mean of 12, 15, 18, 21 and 24?",
      choices: ["16", "17", "18", "19"],
      answer: 2,
      explanation: "The sum is 90 and there are 5 values, so the mean is 90 ÷ 5 = 18." },

    { id: "ge15", subject: "gened", topic: "Social Sciences", difficulty: "Easy",
      question: "Who led the Katipunan at its founding in 1892?",
      choices: ["Emilio Aguinaldo", "Andres Bonifacio", "Apolinario Mabini", "Marcelo del Pilar"],
      answer: 1,
      explanation: "Andres Bonifacio founded and led the Katipunan, the revolutionary society that launched the armed struggle against Spain." },

    { id: "ge16", subject: "gened", topic: "Filipino", difficulty: "Medium",
      question: "Alin ang halimbawa ng tayutay na pagtutulad?",
      choices: ["Ang kanyang mata ay parang bituin.", "Umiiyak ang langit.", "Siya ay bulaklak ng aming tahanan.", "Napakabigat ng aking puso."],
      answer: 0,
      explanation: "Ang pagtutulad o simile ay gumagamit ng pananda tulad ng 'parang', 'tulad ng' o 'gaya ng' sa paghahambing." },

    { id: "ge17", subject: "gened", topic: "Mathematics", difficulty: "Hard",
      question: "A rectangle has a perimeter of 36 cm and a length twice its width. What is its area?",
      choices: ["48 cm²", "54 cm²", "72 cm²", "81 cm²"],
      answer: 2,
      explanation: "With L = 2W, the perimeter gives 2(2W + W) = 36, so W = 6 and L = 12. Area = 12 × 6 = 72 cm²." },

    { id: "ge18", subject: "gened", topic: "Science", difficulty: "Easy",
      question: "Which gas do humans mainly exhale as a waste product of respiration?",
      choices: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
      answer: 2,
      explanation: "Cellular respiration produces carbon dioxide, which the blood carries to the lungs to be exhaled." },

    /* ===== SPECIALIZATION ===== */
    { id: "mj01", subject: "major", topic: "Instructional Planning", difficulty: "Medium",
      question: "Which part of a lesson plan states what learners should be able to do by the end of the lesson?",
      choices: ["Learning objectives", "Materials", "Assignment", "References"],
      answer: 0,
      explanation: "Objectives are specific and measurable statements of intended outcomes, and they drive the choice of activities and assessment." },

    { id: "mj02", subject: "major", topic: "Content Knowledge", difficulty: "Easy",
      question: "Which material best supports young learners meeting an abstract math concept for the first time?",
      choices: ["Concrete manipulatives", "Lecture only", "Textbook reading only", "Verbal explanation only"],
      answer: 0,
      explanation: "Manipulatives give a concrete referent, which matches how concrete operational learners build abstract understanding." },

    { id: "mj03", subject: "major", topic: "Instructional Planning", difficulty: "Medium",
      question: "Which questioning technique best promotes higher-order thinking?",
      choices: ["Yes or no questions", "Fill-in-the-blank questions", "Open-ended why and how questions", "Recall questions"],
      answer: 2,
      explanation: "Why and how questions require learners to analyze relationships and justify reasoning instead of retrieving a stored fact." },

    { id: "mj04", subject: "major", topic: "Classroom Management", difficulty: "Hard",
      question: "Which approach builds intrinsic motivation rather than relying on external rewards?",
      choices: ["Token economy", "Democratic classroom management", "Punishment-based discipline", "Authoritarian control"],
      answer: 1,
      explanation: "Involving learners in setting and enforcing rules gives them ownership, which sustains behavior after rewards are withdrawn." },

    { id: "mj05", subject: "major", topic: "Classroom Management", difficulty: "Medium",
      question: "A teacher scans the room and addresses off-task behavior early. Kounin called this:",
      choices: ["Withitness", "Overlapping", "Momentum", "Satiation"],
      answer: 0,
      explanation: "Withitness is the teacher's demonstrated awareness of everything happening in the room, which prevents small disruptions from spreading." },

    { id: "mj06", subject: "major", topic: "Instructional Planning", difficulty: "Hard",
      question: "In backward design, which step comes first?",
      choices: ["Plan learning activities", "Identify desired results", "Choose textbooks", "Write the assignment"],
      answer: 1,
      explanation: "Wiggins and McTighe start with desired results, then determine acceptable evidence, and only then plan instruction." },

    { id: "mj07", subject: "major", topic: "Content Knowledge", difficulty: "Medium",
      question: "A teacher gives advanced readers a research task while others do guided reading. This is:",
      choices: ["Tracking", "Differentiated instruction", "Remediation", "Acceleration"],
      answer: 1,
      explanation: "Differentiated instruction varies content, process or product within one class to match readiness, interest and learning profile." },

    { id: "mj08", subject: "major", topic: "Classroom Management", difficulty: "Easy",
      question: "The best time to establish classroom routines is:",
      choices: ["After the first grading period", "During the first days of class", "Only when problems appear", "At the end of the school year"],
      answer: 1,
      explanation: "Routines taught and practiced at the start of the year prevent most management problems from forming at all." },

    { id: "mj09", subject: "major", topic: "Content Knowledge", difficulty: "Hard",
      question: "A learner consistently confuses area and perimeter. The most useful teacher response is to:",
      choices: ["Re-teach the formulas faster", "Give more of the same worksheets", "Use tiles and string to build each measure physically", "Move on and revisit next year"],
      answer: 2,
      explanation: "The confusion is conceptual, not computational. Building area with tiles and perimeter with string separates the two ideas before formulas return." },

    { id: "mj10", subject: "major", topic: "Instructional Planning", difficulty: "Medium",
      question: "Which assessment best matches the objective 'demonstrate proper laboratory safety procedures'?",
      choices: ["Multiple choice test", "Performance task with a checklist", "Essay", "Oral recitation"],
      answer: 1,
      explanation: "A performance objective requires the learner to actually perform, observed against criteria. A written test would measure knowing about safety, not doing it." }
  ];

  /* ---------- Lesson notes shown in Review ---------- */
  const LESSONS = {
    "Assessment of Learning": [
      { h: "Purposes of assessment", p: "Diagnostic assessment happens before teaching to find out what learners already know. Formative assessment happens during teaching to guide it. Summative assessment happens after teaching to certify what was learned." },
      { h: "Qualities of a good test", p: "Validity means the test measures what it intends to measure. Reliability means it gives consistent results. A test can be reliable and still invalid, so check validity first." },
      { h: "Interpreting scores", p: "Norm-referenced interpretation compares a learner to the group. Criterion-referenced interpretation compares performance to a set standard of mastery." }
    ],
    "Facilitating Learning": [
      { h: "Behaviorism", p: "Learning is a change in observable behavior shaped by consequences. Reinforcement strengthens behavior, punishment weakens it, and extinction removes the reinforcer." },
      { h: "Cognitive and constructivist views", p: "Learners process and organize information. Piaget emphasized stages and readiness, Vygotsky emphasized social interaction and the zone of proximal development, Bruner emphasized discovery." },
      { h: "Motivation", p: "Intrinsic motivation comes from interest and satisfaction. Extrinsic motivation comes from outside rewards. Sustained learning depends more on the first." }
    ],
    "Learner Development": [
      { h: "Principles of development", p: "Development follows a predictable sequence, proceeds from head to foot and from the center outward, and happens at different rates for each learner." },
      { h: "Erikson's psychosocial stages", p: "Each stage presents a crisis: trust vs mistrust in infancy, industry vs inferiority in school age, identity vs role confusion in adolescence." },
      { h: "Kohlberg's moral stages", p: "Preconventional reasoning is based on consequences, conventional on social approval and law, postconventional on principle." }
    ],
    "Curriculum Development": [
      { h: "Types of curriculum", p: "Recommended, written, taught, supported, assessed, learned and hidden. The taught and learned curricula rarely match the written one exactly." },
      { h: "Curriculum designs", p: "Subject-centered organizes by discipline, learner-centered by learner needs, problem-centered by real-life issues." }
    ],
    "Teaching Profession": [
      { h: "Key laws", p: "RA 4670 Magna Carta for Public School Teachers, RA 7836 Philippine Teachers Professionalization Act, RA 9155 Governance of Basic Education, RA 10533 Enhanced Basic Education Act." },
      { h: "Code of Ethics", p: "The learner comes first. Teachers also owe duties to the state, the community, the profession, colleagues, parents and to themselves as professionals." }
    ],
    "Educational Technology": [
      { h: "Choosing media", p: "Select technology for the learning objective, not novelty. The ASSURE model runs: analyze learners, state objectives, select media, utilize, require participation, evaluate." },
      { h: "TPACK", p: "Effective integration needs technological, pedagogical and content knowledge working together." }
    ],
    "English Language": [
      { h: "Subject-verb agreement", p: "The verb agrees with the head noun, not with a noun inside an intervening phrase. Collective nouns take a singular verb when the group acts as one." },
      { h: "Parallelism", p: "Items joined in a series must share the same grammatical form." }
    ],
    "Mathematics": [
      { h: "Ratio and proportion", p: "Add the ratio parts, divide the total by that number to find the value of one part, then multiply." },
      { h: "Percentage", p: "Percent means per hundred. To discount, multiply by (1 − rate). To add markup or tax, multiply by (1 + rate)." }
    ],
    "Science": [
      { h: "Cell structures", p: "The nucleus stores genetic material, mitochondria produce ATP, ribosomes build proteins, chloroplasts carry out photosynthesis in plants." },
      { h: "Electromagnetic spectrum", p: "From longest to shortest wavelength: radio, microwave, infrared, visible, ultraviolet, X-ray, gamma." }
    ],
    "Filipino": [
      { h: "Pang-angkop", p: "Ginagamit ang na, ng at g upang pag-ugnayin ang panuring at ang salitang tinuturingan." },
      { h: "Mga tayutay", p: "Pagtutulad ay may pananda tulad ng parang. Pagwawangis ay tuwirang paghahambing. Pagsasatao ay pagbibigay ng katangiang pantao." }
    ],
    "Social Sciences": [
      { h: "1987 Constitution", p: "Sovereignty resides in the people. The three branches are the Legislative, Executive and Judiciary, each with checks on the others." },
      { h: "Philippine revolution", p: "Bonifacio founded the Katipunan in 1892. Independence was proclaimed in Kawit on June 12, 1898." }
    ],
    "Content Knowledge": [
      { h: "Teaching for understanding", p: "Move from concrete to representational to abstract. Misconceptions need a different experience, not a louder repetition of the same explanation." }
    ],
    "Instructional Planning": [
      { h: "Backward design", p: "Identify desired results, determine acceptable evidence, then plan learning experiences." },
      { h: "Matching assessment to objective", p: "Knowledge objectives can use written tests. Performance objectives need performance tasks judged with a rubric or checklist." }
    ],
    "Classroom Management": [
      { h: "Preventive management", p: "Kounin's withitness, overlapping, momentum and smoothness keep lessons moving and stop disruptions before they spread." },
      { h: "Routines", p: "Teach, model and practice routines in the first days of class. Consistency matters more than severity." }
    ]
  };

  /* ---------- Flashcards ---------- */
  const FLASHCARDS = [
    { topic: "Assessment of Learning", front: "Validity", back: "The degree to which a test measures what it is supposed to measure." },
    { topic: "Assessment of Learning", front: "Reliability", back: "Consistency of results across repeated administrations." },
    { topic: "Assessment of Learning", front: "Diagnostic assessment", back: "Given before instruction to identify prior knowledge and gaps." },
    { topic: "Facilitating Learning", front: "Zone of proximal development", back: "The gap between what a learner can do alone and with guidance." },
    { topic: "Facilitating Learning", front: "Scaffolding", back: "Temporary support that is gradually withdrawn as competence grows." },
    { topic: "Facilitating Learning", front: "Negative reinforcement", back: "Removing an unpleasant stimulus to strengthen a behavior." },
    { topic: "Learner Development", front: "Cephalocaudal", back: "Development proceeds from the head downward." },
    { topic: "Learner Development", front: "Identity vs role confusion", back: "Erikson's adolescent crisis: forming a coherent sense of self." },
    { topic: "Curriculum Development", front: "Hidden curriculum", back: "Unplanned values and norms learners absorb from school life." },
    { topic: "Teaching Profession", front: "RA 7836", back: "Philippine Teachers Professionalization Act, which established the LET." },
    { topic: "Teaching Profession", front: "RA 4670", back: "Magna Carta for Public School Teachers." },
    { topic: "Educational Technology", front: "TPACK", back: "Technological, Pedagogical and Content Knowledge combined." },
    { topic: "Educational Technology", front: "ASSURE model", back: "Analyze, State, Select, Utilize, Require participation, Evaluate." },
    { topic: "Mathematics", front: "Mean", back: "Sum of all values divided by the number of values." },
    { topic: "Science", front: "Mitochondrion", back: "Organelle that produces ATP through cellular respiration." },
    { topic: "Filipino", front: "Pang-angkop", back: "Na, ng o g na nag-uugnay sa panuring at salitang tinuturingan." },
    { topic: "English Language", front: "Parallelism", back: "Items in a series share the same grammatical form." },
    { topic: "Social Sciences", front: "Sovereignty", back: "Supreme authority, which the Constitution places in the people." },
    { topic: "Classroom Management", front: "Withitness", back: "Teacher awareness of everything happening in the classroom." },
    { topic: "Instructional Planning", front: "Backward design", back: "Plan from desired results to evidence to activities." }
  ];

  /* ---------- LET tracks ---------- */
  const TRACKS = [
    { id: "elem", name: "Elementary", blurb: "General Education and Professional Education" },
    { id: "sec", name: "Secondary", blurb: "General Education, Professional Education and a major" }
  ];

  const MAJORS = ["English", "Filipino", "Mathematics", "Biological Science", "Physical Science",
    "Social Studies", "MAPEH", "TLE", "Values Education", "Not applicable"];

  global.DATA = { SUBJECTS, TOPICS, QUESTIONS, LESSONS, FLASHCARDS, TRACKS, MAJORS };
})(window);
