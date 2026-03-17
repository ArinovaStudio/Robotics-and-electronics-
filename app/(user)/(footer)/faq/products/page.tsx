import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { ChevronDown } from "lucide-react";

export const metadata = {
  title: `Products FAQ | ${SITE_NAME}`,
  description: "Frequently asked questions about robotics components, microcontrollers, and building your first robot.",
};

const faqs = [
  {
    question: "What is the use of a microcontroller in robotics?",
    answer: "A microcontroller acts as the brain of the robot. It processes input from sensors and sends signals to motors or actuators to perform actions. Common microcontrollers include Arduino Uno, ESP32 Dev Board, and Raspberry Pi Pico.",
  },
  {
    question: "What types of motors are used in robotics?",
    answer: ["DC motor for simple movement", "Servo Motor for precise angle control", "Stepper Motor for accurate positioning", "For beginner robots, the SG90 Micro Servo Motor and BO geared motors are widely used."],
  },
  {
    question: "Why are motor drivers used in robotics?",
    answer: "Motor Drivers control the speed and direction of motors. Microcontrollers cannot directly power motors, so motor drivers act as an interface between the controller and the motor. A common motor driver used in robotics projects is L298N Motor Driver Module.",
  },
  {
    question: "What is the primary use of the robot chassis and why does it play an important role?",
    answer: "A robot chassis is the structural frame that holds all components like motors, sensors, batteries, and controllers. It provides stability and allows the robot to move efficiently.",
  },
  {
    question: "What power sources are used in robotics projects?",
    answer: ["18650 lithium batteries", "9V batteries", "Rechargeable Li-ion battery packs", "These provide power to motors and electronic components."],
  },
  {
    question: "What is an IoT module and its role in robotics?",
    answer: "IoT modules allow robots to connect to the internet and communicate with other devices. They are used for remote monitoring and smart automation. Examples include Wi-Fi modules and Bluetooth modules.",
  },
  {
    question: "Which robotics components are best for beginners?",
    answer: ["Arduino Board", "Ultrasonic Sensor", "IR Obstacle sensor", "DC motors", "Motor driver module", "Breadboard and jumper wires", "These components help students learn basic robotic concepts."],
  },
  {
    question: "What robotics projects use servo motors?",
    answer: ["Robotic arms", "Pan-tilt camera systems", "Robot Steering Mechanism", "Automation Systems"],
  },
  {
    question: "Why is Arduino popular for robotics?",
    answer: ["Easy to use and program", "Beginner friendly", "Compatible with many sensors and modules"],
  },
  {
    question: "Do I need a motor driver for DC motor?",
    answer: "Yes. A motor driver such as L298N Motor Driver Module is required to control the speed and direction of DC motors.",
  },
  {
    question: "Are these components suitable for beginners?",
    answer: "Yes. These components are widely used in student robotics projects and beginner electronics experiments.",
  },
  {
    question: "Are these components compatible with Arduino?",
    answer: "Most sensors, motors, and modules sold for robotics projects are designed to work with Arduino boards.",
  },
  {
    question: "What programming language does Arduino use?",
    answer: "Arduino uses a simplified version of C/C++ programming language.",
  },
  {
    question: "What projects can be built using Arduino?",
    answer: ["Line Following robots", "Obstacle avoiding robots", "Home automation systems", "IoT monitoring systems"],
  },
  {
    question: "Can beginners use Arduino boards?",
    answer: "Yes. Arduino boards are one of the best platforms for beginners to learn electronics and robotics.",
  },
];

export default function ProductsFAQPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-700 transition">Home</Link>
          <span>›</span>
          <span className="text-gray-400">FAQ</span>
          <span>›</span>
          <span className="text-gray-700 font-semibold">Products</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#050a30] mb-8 tracking-tight uppercase">
          Robotics Components FAQs
        </h1>

        {/* FAQ Accordion */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group border border-gray-200 rounded-xl bg-white overflow-hidden [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold text-[#050a30] hover:bg-gray-50 transition-colors">
                <span className="pr-6">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className="text-gray-400 transition-transform duration-300 group-open:-rotate-180 flex-shrink-0"
                />
              </summary>
              <div className="p-5 pt-0 text-gray-600 leading-relaxed border-t border-gray-100">
                {Array.isArray(faq.answer) ? (
                  <ul className="mt-3 list-disc list-inside space-y-1">
                    {faq.answer.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="mt-3">{faq.answer}</p>
                )}
              </div>
            </details>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-start">
          <h3 className="font-bold text-[#050a30] mb-2">Still have questions?</h3>
          <p className="text-sm text-gray-600 mb-5">
            Our team of robotics experts is here to help you get started with your project.
          </p>
          <Link
            href="/contact"
            className="bg-[#050a30] hover:bg-[#0a0f3c] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            Contact Support
          </Link>
        </div>

      </div>
    </div>
  );
}
