import { cn } from "@/lib/utils";
import {
  Search,
  ShieldCheck,
  MessageSquare,
  FileText,
  Zap,
  Languages,
  Quote,
  Clock,
} from "lucide-react";

export const Features = () => {
  const features = [
    {
      title: "AI-Powered Analysis",
      description:
        "Extract deep insights from complex documents using state-of-the-art language models.",
      icon: <Search />,
    },
    {
      title: "Secure Uploads",
      description:
        "Your documents are encrypted and processed securely. We prioritize your data privacy.",
      icon: <ShieldCheck />,
    },
    {
      title: "Context-Aware Answers",
      description:
        "Get precise answers derived directly from your PDFs, not generic AI hallucinations.",
      icon: <MessageSquare />,
    },
    {
      title: "Intelligent Parsing",
      description:
        "Handles tables, diagrams, and complex layouts to ensure no information is missed.",
      icon: <FileText />,
    },
    {
      title: "Fast Vector Search",
      description:
        "Retrieve relevant information from thousands of pages in milliseconds.",
      icon: <Zap />,
    },
    {
      title: "Multi-language Support",
      description:
        "Analyze and chat with documents in over 50 different languages seamlessly.",
      icon: <Languages />,
    },
    {
      title: "Citation Tracking",
      description:
        "Every answer comes with clear references to the exact page and paragraph in your PDF.",
      icon: <Quote />,
    },
    {
      title: "24/7 Availability",
      description:
        "Get instant support and document analysis anytime, anywhere, on any device.",
      icon: <Clock />,
    },
  ];

  return (
    <div className="pt-4 px-4 sm:px-6 md:px-12 lg:px-12 w-full max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-textPrimary dark:text-white mb-4">
          Why Choose QuickQuery?
        </h2>
        <p className="text-xl text-textSecondary max-w-2xl mx-auto">
          Experience the next generation of document interaction with our
          cutting-edge RAG technology
        </p>
      </div>

      <div className="grid grid-cols-1 min-[450px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 relative z-10">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </div>
  );
};

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-borderPrimary",
        (index === 0 || index === 4) && "lg:border-l border-borderPrimary",
        index < 4 && "lg:border-b border-borderPrimary",
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-hoverPrimary pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-hoverPrimary pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-textPrimary">{icon}</div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-slate-300 dark:bg-slate-700 group-hover/feature:bg-primary transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-textPrimary">
          {title}
        </span>
      </div>
      <p className="text-sm text-textSecondary max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
