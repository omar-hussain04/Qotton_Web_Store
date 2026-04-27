import { Container } from "@/components/ui/Container";

const faqs = [
  {
    question: "متى سيصل طلبي؟",
    answer: "في داخل المدن الرئيسية يستغرق التوصيل من 2-4 أيام عمل. لشركات الشحن الأخرى أو خارج المناطق الرئيسية قد يستغرق الأمر حتى 7 أيام."
  },
  {
    question: "هل يمكنني استبدال الطلب؟",
    answer: "نعم يمكنك استبدال طلبك خلال 14 يوم من استلام طلبك ، ويشترط بأن يكون المنتج بحالة ممتازة بدون غسله او اتلافه."
  },
  {
    question: "كيف أختار المقاس المناسب؟",
    answer: "منتجاتنا مصممة بقصّة 'أوفر سايز' (Oversize) المريحة. يمكنك زيارة دليل المقاسات في صفحة تفاصيل المنتج لاختيار ما يناسب مقاسك بدقة."
  },
  {
    question: "هل يتوفر شحن دولي؟",
    answer: "في الوقت الحالي نقتصر على الشحن الداخلي فقط، ونسعى للوصول لعملائنا في جميع دول العالم قريباً."
  }
];

export default function FAQPage() {
  return (
    <Container className="py-20 flex-1">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-text mb-4 text-center">الأسئلة الشائعة</h1>
        <p className="text-muted text-center mb-12">أكثر الأسئلة تكراراً لتوفير وقتك وجهدك</p>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-surface border border-border/50 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-heading font-bold text-accent mb-3">{faq.question}</h3>
              <p className="text-text/80 leading-relaxed font-sans">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
