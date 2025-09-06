"use client";

const ResumeQuestions = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-2xl">
        <h1 className="text-2xl font-bold text-green-600 mb-4">❓ Resume Questions</h1>
        <p className="text-gray-700 mb-6">
          This feature allows you to view common resume questions to help prepare for interviews.
        </p>

        <ul className="text-left list-disc list-inside space-y-2 text-gray-800">
          <li>What are your strengths and weaknesses?</li>
          <li>Describe a challenging situation and how you handled it.</li>
          <li>Explain a gap in your resume.</li>
          <li>Why are you interested in this role?</li>
          <li>Describe your key achievements.</li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeQuestions;
