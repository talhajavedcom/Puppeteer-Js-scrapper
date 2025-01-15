export const filters = [

  {
    assessment: { value: "100", label: "PSAT/NMSQT & PSAT 10" },
    test: { value: "1", label: "Reading and Writing" },
    domain: [
      {
        id: "#checkbox-information\\ and\\ ideas",
        label: "checkbox-information and ideas",
      },
      {
        id: "#checkbox-expression\\ of\\ ideas",
        label: "checkbox-expression of ideas",
      },
      {
        id: "#checkbox-standard\\ english\\ conventions",
        label: "checkbox-standard english conventions",
      },
    ],
    fileNamePrefix: "PSAT_Reading_and_Writing",
    folderName: "PSAT_Reading_and_Writing",
  },
  {
    assessment: { value: "100", label: "PSAT/NMSQT & PSAT 10" },
    test: { value: "2", label: "Math" },
    domain: [
      { id: "#checkbox-algebra", label: "checkbox-algebra" },
      { id: "#checkbox-advanced\\ math", label: "checkbox-advanced math" },
      {
        id: "#checkbox-problem-solving\\ and\\ data\\ analysis",
        label: "checkbox-problem-solving and data analysis",
      },
      {
        id: "#checkbox-geometry\\ and\\ trigonometry",
        label: "checkbox-geometry and trigonometry",
      },
    ],
    fileNamePrefix: "PSAT_Math",
    folderName: "PSAT_Math",
  },

  {
    assessment: { value: "102", label: "PSAT 8/9" },
    test: { value: "1", label: "Reading and Writing" },
    domain: [
      {
        id: "#checkbox-information\\ and\\ ideas",
        label: "checkbox-information and ideas",
      },
      {
        id: "#checkbox-craft\\ and\\ structure",
        label: "checkbox-craft and structure",
      },
      {
        id: "#checkbox-expression\\ of\\ ideas",
        label: "checkbox-expression of ideas",
      },
      {
        id: "#checkbox-standard\\ english\\ conventions",
        label: "checkbox-standard english conventions",
      },
    ],
    fileNamePrefix: "PSAT_8_9_Reading_and_Writing",
    folderName: "PSAT_8_9_Reading_and_Writing",
  },
  {
    assessment: { value: "102", label: "PSAT 8/9" },
    test: { value: "2", label: "Math" },
    domain: [
      { id: "#checkbox-algebra", label: "checkbox-algebra" },
      { id: "#checkbox-advanced\\ math", label: "checkbox-advanced math" },
      {
        id: "#checkbox-problem-solving\\ and\\ data\\ analysis",
        label: "checkbox-problem-solving and data analysis",
      },
      {
        id: "#checkbox-geometry\\ and\\ trigonometry",
        label: "checkbox-geometry and trigonometry",
      },
    ],
    fileNamePrefix: "PSAT_8_9_Math",
    folderName: "PSAT_8_9_Math",
  },
];
