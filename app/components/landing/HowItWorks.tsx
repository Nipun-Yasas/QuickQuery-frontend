export const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Upload Your PDF",
      description:
        "Drag and drop your documents. Our system supports multiple files and large PDFs seamlessly.",
    },
    {
      number: "2",
      title: "AI Processes Content",
      description:
        "Our AI analyzes the text, tables, and structure to create a smart knowledge base of your data.",
    },
    {
      number: "3",
      title: "Ask & Get Answers",
      description:
        "Ask anything about your documents and get instant, cited answers with page references.",
    },
  ];

  return (
    <div className="pt-4 lg:pt-12 px-4 sm:px-6 md:px-12 lg:px-12 w-full max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-textPrimary mb-4">
          How It Works
        </h2>
        <p className="text-xl text-textSecondary">
          Unlock the knowledge hidden in your documents in three simple steps
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="relative"
            style={{ zIndex: steps.length - idx }}
          >
            <div className="bg-backgroundSecondary p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-borderPrimary">
              <div className="w-16 h-16 bg-hoverPrimary rounded-full flex items-center justify-center text-textPrimary text-2xl font-bold mb-6 ">
                {step.number}
              </div>
              <h3 className="text-2xl font-bold text-textPrimary mb-3">
                {step.title}
              </h3>
              <p className="text-textSecondary">{step.description}</p>
            </div>
            {idx < steps.length - 1 && (
              <div className="hidden md:block absolute top-[62px] left-24 -right-8 h-1 bg-primary" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
