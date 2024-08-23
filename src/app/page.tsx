"use client";

import "@radix-ui/themes/styles.css";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label as BaseLabel } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import * as Popover from "@radix-ui/react-popover";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";

// Add this interface definition before the MultiSelect component
interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

// MultiSelect component
function MultiSelect({ options, selected, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Select options"
        >
          {selected.length === 0
            ? "Select options"
            : `${selected.length} selected`}
          {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </Popover.Trigger>
      <Popover.Content className="w-[200px] p-1 bg-white border rounded-md shadow-lg z-50 absolute">        
        <div className="space-y-1">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selected, option]);
                  } else {
                    onChange(selected.filter((item) => item !== option));
                  }
                }}
                className="mr-2"
              />
              <span className="text-sm">{option}</span>
              {selected.includes(option) && <CheckIcon className="ml-auto" />}
            </label>
          ))}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}

// Create a custom Label component with the desired styles
const Label = (props) => (
  <BaseLabel
    {...props}
    className={`block mb-2 text-gray-600 ${props.className || ""}`}
  />
);

export default function PricingCalculator() {
  const [candidates, setCandidates] = useState<number>(100);
  const [assessmentTypes, setAssessmentTypes] = useState<string[]>([]);
  const [conductInterviews, setConductInterviews] = useState<boolean>(false);
  const [addOns, setAddOns] = useState<string[]>([]);
  const [aiFeatures, setAIFeatures] = useState<string[]>([]);
  const [credits, setCredits] = useState({
    total: 0,
    assessment: 0,
    interview: 0,
    addOn: 0,
    aiFeature: 0,
  });

  const assessmentOptions = [
    { label: "Assessments with MCQ, MCA, Subjective, Video and Work Sample Questions", credits: 1 },
    { label: "Assessments with Programming or Database type questions", credits: 2 },
    { label: "Assessments with Projects, Machine Learning, Data Science, DevOps questions", credits: 4 },
  ];

  const addOnOptions = [
    { label: "Whole Screen Recording", credits: 2 },
    { label: "Audio Proctoring", credits: 1 },
    { label: "Video Proctoring", credits: 1 },
    { label: "Interview Recording", credits: 2 },
    { label: "AI Scoring for Video Questions", credits: 1 },
    { label: "AI Scoring for Subjective Questions", credits: 1 },
  ];

  const aiFeaturesOptions = [
    { label: "Create MCQ / MCA Questions with AI", credits: 1, type: "question" },
    { label: "Create Programming Questions with AI", credits: 1, type: "question" },
    { label: "Create Assessments with WeCP AI", credits: 4, type: "test" },
  ];

  const calculateCredits = () => {
    const assessmentCredits = assessmentTypes.reduce((total, type) => {
      const assessment = assessmentOptions.find(a => a.label === type);
      return total + (assessment ? assessment.credits * candidates : 0);
    }, 0);

    let interviewCredits = 0;
    if (conductInterviews) {
      const interviewCandidates = Math.ceil(candidates * 0.25); // 25% of candidates
      interviewCredits = interviewCandidates * 1; // 1 credit per interview
    }

    const addOnCredits = addOns.reduce((total, addon) => {
      const option = addOnOptions.find(a => a.label === addon);
      return total + (option ? option.credits * candidates : 0);
    }, 0);

    const aiFeatureCredits = aiFeatures.reduce((total, feature) => {
      const option = aiFeaturesOptions.find(a => a.label === feature);
      if (!option) return total;

      const testsNeeded = Math.ceil(candidates / 100);
      if (option.type === "question") {
        // 15 questions per test
        return total + (option.credits * 15 * testsNeeded);
      } else {
        // Credits per test
        return total + (option.credits * testsNeeded);
      }
    }, 0);

    const totalCredits =
      assessmentCredits + interviewCredits + addOnCredits + aiFeatureCredits;

    setCredits({
      total: totalCredits,
      assessment: assessmentCredits,
      interview: interviewCredits,
      addOn: addOnCredits,
      aiFeature: aiFeatureCredits,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl shadow-lg">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  Assessment Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="candidates" className="block mb-2">
                      How many candidates would you like to assess?
                    </Label>
                    <Input
                      id="candidates"
                      type="number"
                      value={candidates}
                      onChange={(e) => setCandidates(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="block mb-2">
                      Which type of assessments would you like to create?
                    </Label>
                    <MultiSelect
                      options={assessmentOptions.map(a => a.label)}
                      selected={assessmentTypes}
                      onChange={setAssessmentTypes}
                      className="mt-2"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Interviews</h2>
                <div>
                  <Label className="block mb-2">
                    Would you also like to conduct live hands-on interviews?
                  </Label>
                  <div className="space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="yes"
                        checked={conductInterviews}
                        onChange={() => setConductInterviews(true)}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="no"
                        checked={!conductInterviews}
                        onChange={() => setConductInterviews(false)}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    The credit calculation for interviews will run on the
                    assumption that 25% of candidates from assessments will be
                    shortlisted for interviews.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">WeCP Add-ons</h2>
                <Label className="block mb-2">
                  Which add-ons would you require?
                </Label>
                <MultiSelect
                  options={addOnOptions.map(a => a.label)}
                  selected={addOns}
                  onChange={setAddOns}
                  className="mt-2"
                />
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  WeCP AI Features
                </h2>
                <Label className="block mb-2">
                  Which WeCP features would you require?
                </Label>
                <MultiSelect
                  options={aiFeaturesOptions.map(a => a.label)}
                  selected={aiFeatures}
                  onChange={setAIFeatures}
                />
              </section>

              <Button
                onClick={calculateCredits}
                className="w-full bg-gray-900 text-white hover:bg-black py-2 text-lg"
              >
                Calculate
              </Button>
            </div>

            <div className="bg-blue-600 text-white rounded-lg p-6 flex flex-col items-center justify-between h-full">
              <div className="text-center flex-grow flex flex-col justify-center">
                <div className="text-8xl font-bold mb-2">{credits.total}</div>
                <div className="text-2xl mb-8 text-white opacity-80">
                  Credits needed per month
                </div>
                <div className="space-y-4 text-l w-full max-w-xs opacity-50">
                  <div className="flex justify-between">
                    <span>Assessment Credits</span>
                    <span>{credits.assessment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interview Credits</span>
                    <span>{credits.interview}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Add-on Credits</span>
                    <span>{credits.addOn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Feature Credits</span>
                    <span>{credits.aiFeature}</span>
                  </div>
                </div>
              </div>
              {/* <Button variant="outline" className="text-black border-white hover:bg-white hover:text-green-600 text-lg py-2 px-4 mt-6 w-full max-w-xs">
                Compare all our pricing plans
              </Button> */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}