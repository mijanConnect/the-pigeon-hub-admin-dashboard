// import { useMyProfileQuery } from "@/redux/featured/auth/authApi";


export const convertBackendToExistingFormat = (backendResponse, role) => {
  if (!backendResponse?.data) {
    return {
      nodes: [],
      edges: [],
    };
  }


  const subject = backendResponse.data;
  const nodes = [];
  const edges = [];


const maxGeneration = role === "PAIDUSER" ? 4 : 4;


  // Helper function to format results
  const formatResults = (results) => {
    if (!results || !Array.isArray(results) || results.length === 0) {
      return null;
    }


    return results.map((item) => String(item).trim()).join("\n");
  };


  // Helper function to get gender from data
  const getGender = (genderData) => {
    if (typeof genderData === "string") {
      const gender = genderData.toLowerCase();
      if (gender === "hen") return "Hen";
      if (gender === "cock") return "Cock";
      if (gender === "unspecified") return "Unspecified";
    }
    return "Unspecified";
  };


  // Helper function to get breeder name
  const getBreederInfo = (breeder) => {
    if (typeof breeder === "object" && breeder) {
      const name = breeder.breederName;
      return name;
    }
    return breeder;
  };


  // Helper function to get breeder verification/status
  const getBreederStatus = (breeder) => {
    if (typeof breeder === "object" && breeder) {
      // Check for 'status' field (true/false)
      return breeder.status === true;
    }
    return false;
  };


  // Helper function to get pigeon verification status
  const getPigeonVerification = (pigeon) => {
    return pigeon?.verified === true;
  };


  // Helper function to get pigeon iconic status
  const getPigeonIconic = (pigeon) => {
    return pigeon?.iconic === true;
  };


  // Helper function to get pigeon iconic score
  const getPigeonIconicScore = (pigeon) => {
    return pigeon?.iconicScore || null;
  };


  // Helper function to create empty node
  const createEmptyNode = (id, position, positionLabel, generation) => {
    return {
      id: id,
      type: "pigeonNode",
      position: position,
      data: {
        isEmpty: true,
        generation: generation,
      },
    };
  };


  // Subject node (Generation 0) - All data included
  // CHANGED: handles set to "top-bottom" for connections from top and bottom
  nodes.push({
    id: "subject",
    type: "pigeonNode",
    position: { x: 0, y: 500 },
    data: {
      name: subject.name,
      ringNumber: subject.ringNumber,
      owner: getBreederInfo(subject.breeder),
      country: subject.country,
      gender: getGender(subject.gender),
      generation: 0,
      position: "Subject",
      birthYear: subject.birthYear?.toString(),
      color: "#FFFFE0",
      colorName: subject.color,
      // description: subject.notes || subject.shortInfo,
      achievements: formatResults(subject.addresults),
      verified: getPigeonVerification(subject),
      breederVerified: getBreederStatus(subject.breeder),
      iconic: getPigeonIconic(subject),
      iconicScore: getPigeonIconicScore(subject),
      handles: "top-bottom", // This ensures connections come from top and bottom
      isEmpty: false,
    },
  });


  // Generation 1 - Father
  // CHANGED: Position adjusted to be above subject, handles changed
  if (subject.fatherRingId) {
    nodes.push({
      id: "father_1",
      type: "pigeonNode",
      position: { x: 180, y: -200 }, // Changed from { x: 320, y: -200 }
      data: {
        name: subject.fatherRingId.name,
        ringNumber: subject.fatherRingId.ringNumber,
        owner: getBreederInfo(subject.fatherRingId.breeder),
        country: subject.fatherRingId.country,
        gender: getGender(subject.fatherRingId.gender),
        generation: 1,
        position: "Father",
        birthYear: subject.fatherRingId.birthYear?.toString(),
        color: "#ADD8E6",
        colorName: subject.fatherRingId.color,
        // description:
        //   subject.fatherRingId.notes || subject.fatherRingId.shortInfo,
        achievements: formatResults(subject.fatherRingId.addresults),
        verified: getPigeonVerification(subject.fatherRingId),
        breederVerified: getBreederStatus(subject.fatherRingId.breeder),
        iconic: getPigeonIconic(subject.fatherRingId),
        iconicScore: getPigeonIconicScore(subject.fatherRingId),
        handles: "right-only",
        isEmpty: false,
      },
    });
  } else {
    nodes.push(createEmptyNode("father_1", { x: 0, y: -200 }, "Father", 1)); // Changed position
  }


  edges.push({
    id: "subject-father_1",
    source: "subject",
    target: "father_1",
    sourceHandle: "top", // Connect from subject's TOP handle
    targetHandle: null, // Connect to father's default LEFT handle
    type: "smoothstep",
    style: { stroke: "#37B7C3", strokeWidth: 3 },
  });


  // Generation 1 - Mother
  // CHANGED: Position adjusted to be below subject
  if (subject.motherRingId) {
    nodes.push({
      id: "mother_1",
      type: "pigeonNode",
      position: { x: 180, y: 1200 }, // Changed from { x: 320, y: 1210 }
      data: {
        name: subject.motherRingId.name,
        ringNumber: subject.motherRingId.ringNumber,
        owner: getBreederInfo(subject.motherRingId.breeder),
        country: subject.motherRingId.country,
        gender: getGender(subject.motherRingId.gender),
        generation: 1,
        position: "Mother",
        birthYear: subject.motherRingId.birthYear?.toString(),
        color: "#fff",
        colorName: subject.motherRingId.color,
        // description:
        //   subject.motherRingId.notes || subject.motherRingId.shortInfo,
        achievements: formatResults(subject.motherRingId.addresults),
        verified: getPigeonVerification(subject.motherRingId),
        breederVerified: getBreederStatus(subject.motherRingId.breeder),
        iconic: getPigeonIconic(subject.motherRingId),
        iconicScore: getPigeonIconicScore(subject.motherRingId),
        handles: "right-only",
        isEmpty: false,
      },
    });


    edges.push({
      id: "subject-mother_1",
      source: "subject",
      target: "mother_1",
      type: "smoothstep",
      style: { stroke: "#37B7C3", strokeWidth: 3 },
      sourceHandle: "bottom", // ADDED: Specify source handle
    });
  } else {
    nodes.push(createEmptyNode("mother_1", { x: 180, y: 1220 }, "Mother", 1)); // Changed position
    edges.push({
      id: "subject-mother_1",
      source: "subject",
      target: "mother_1",
      type: "smoothstep",
      style: { stroke: "#37B7C3", strokeWidth: 3 },
      sourceHandle: "bottom", // ADDED: Specify source handle
    });
  }


  // Generation 2 - Grandparents
  // Father side - Grandfather (FP)
  if (subject.fatherRingId?.fatherRingId) {
    nodes.push({
      id: "father_2_1",
      type: "pigeonNode",
      position: { x: 500, y: -200 }, // Shifted right from father_1
      data: {
        name: subject.fatherRingId.fatherRingId.name,
        ringNumber: subject.fatherRingId.fatherRingId.ringNumber,
        owner: getBreederInfo(subject.fatherRingId.fatherRingId.breeder),
        country: subject.fatherRingId.fatherRingId.country,
        gender: getGender(subject.fatherRingId.fatherRingId.gender),
        generation: 2,
        position: "Grandfather (FP)",
        birthYear: subject.fatherRingId.fatherRingId.birthYear?.toString(),
        color: "#fff",
        colorName: subject.fatherRingId.fatherRingId.color,
        // description:
        //   subject.fatherRingId.fatherRingId.notes ||
        //   subject.fatherRingId.fatherRingId.shortInfo ||
        //   "Top racing cock.",
        achievements: formatResults(
          subject.fatherRingId.fatherRingId.addresults
        ),
        verified: getPigeonVerification(subject.fatherRingId.fatherRingId),
        breederVerified: getBreederStatus(
          subject.fatherRingId.fatherRingId.breeder
        ),
        iconic: getPigeonIconic(subject.fatherRingId.fatherRingId),
        iconicScore: getPigeonIconicScore(subject.fatherRingId.fatherRingId),
        isEmpty: false,
      },
    });
  } else {
    nodes.push(
      createEmptyNode("father_2_1", { x: 500, y: -200 }, "Grandfather (FP)", 2)
    );
  }


  edges.push({
    id: "father_1-father_2_1",
    source: "father_1",
    target: "father_2_1",
    type: "smoothstep",
    style: { stroke: "#37B7C3", strokeWidth: 2.5 },
  });


  // Father side - Grandmother (FP)
  if (subject.fatherRingId?.motherRingId) {
    nodes.push({
      id: "mother_2_1",
      type: "pigeonNode",
      position: { x: 500, y: 310 },
      data: {
        name: subject.fatherRingId.motherRingId.name,
        ringNumber: subject.fatherRingId.motherRingId.ringNumber,
        owner: getBreederInfo(subject.fatherRingId.motherRingId.breeder),
        country: subject.fatherRingId.motherRingId.country,
        gender: getGender(subject.fatherRingId.motherRingId.gender),
        generation: 2,
        position: "Grandmother (FP)",
        birthYear: subject.fatherRingId.motherRingId.birthYear?.toString(),
        color: "#fff",
        colorName: subject.fatherRingId.motherRingId.color,
        // description:
        //   subject.fatherRingId.motherRingId.notes ||
        //   subject.fatherRingId.motherRingId.shortInfo,
        achievements:
          formatResults(subject.fatherRingId.motherRingId.addresults) ||
          "Top producer",
        verified: getPigeonVerification(subject.fatherRingId.motherRingId),
        breederVerified: getBreederStatus(
          subject.fatherRingId.motherRingId.breeder
        ),
        iconic: getPigeonIconic(subject.fatherRingId.motherRingId),
        iconicScore: getPigeonIconicScore(subject.fatherRingId.motherRingId),
        isEmpty: false,
      },
    });
  } else {
    nodes.push(
      createEmptyNode("mother_2_1", { x: 500, y: 320 }, "Grandmother (FP)", 2)
    );
  }


  edges.push({
    id: "father_1-mother_2_1",
    source: "father_1",
    target: "mother_2_1",
    type: "smoothstep",
    style: { stroke: "#37B7C3", strokeWidth: 2.5 },
  });


  // Mother side - Grandfather (MP)
  if (subject.motherRingId?.fatherRingId) {
    nodes.push({
      id: "father_2_2",
      type: "pigeonNode",
      position: { x: 500, y: 880 },
      data: {
        name: subject.motherRingId.fatherRingId.name,
        ringNumber: subject.motherRingId.fatherRingId.ringNumber,
        owner: getBreederInfo(subject.motherRingId.fatherRingId.breeder),
        country: subject.motherRingId.fatherRingId.country,
        gender: getGender(subject.motherRingId.fatherRingId.gender),
        generation: 2,
        position: "Grandfather (MP)",
        birthYear: subject.motherRingId.fatherRingId.birthYear?.toString(),
        color: "#fff",
        colorName: subject.motherRingId.fatherRingId.color,
        // description:
        //   subject.motherRingId.fatherRingId.notes ||
        //   subject.motherRingId.fatherRingId.shortInfo,
        achievements:
          formatResults(subject.motherRingId.fatherRingId.addresults) ||
          "National ace",
        verified: getPigeonVerification(subject.motherRingId.fatherRingId),
        breederVerified: getBreederStatus(
          subject.motherRingId.fatherRingId.breeder
        ),
        iconic: getPigeonIconic(subject.motherRingId.fatherRingId),
        iconicScore: getPigeonIconicScore(subject.motherRingId.fatherRingId),
        isEmpty: false,
      },
    });
  } else {
    nodes.push(
      createEmptyNode("father_2_2", { x: 500, y: 850 }, "Grandfather (MP)", 2)
    );
  }


  edges.push({
    id: "mother_1-father_2_2",
    source: "mother_1",
    target: "father_2_2",
    type: "smoothstep",
    style: { stroke: "#37B7C3", strokeWidth: 2.5 },
  });


  // Mother side - Grandmother (MP)
  if (subject.motherRingId?.motherRingId) {
    nodes.push({
      id: "mother_2_2",
      type: "pigeonNode",
      position: { x: 500, y: 1400 },
      data: {
        name: subject.motherRingId.motherRingId.name,
        ringNumber: subject.motherRingId.motherRingId.ringNumber,
        owner: getBreederInfo(subject.motherRingId.motherRingId.breeder),
        country: subject.motherRingId.motherRingId.country,
        gender: getGender(subject.motherRingId.motherRingId.gender),
        generation: 2,
        position: "Grandmother (MP)",
        birthYear: subject.motherRingId.motherRingId.birthYear?.toString(),
        color: "#fff",
        colorName: subject.motherRingId.motherRingId.color,
        // description:
        //   subject.motherRingId.motherRingId.notes ||
        //   subject.motherRingId.motherRingId.shortInfo ||
        //   "Foundation hen.",
        achievements: formatResults(
          subject.motherRingId.motherRingId.addresults
        ),
        verified: getPigeonVerification(subject.motherRingId.motherRingId),
        breederVerified: getBreederStatus(
          subject.motherRingId.motherRingId.breeder
        ),
        iconic: getPigeonIconic(subject.motherRingId.motherRingId),
        iconicScore: getPigeonIconicScore(subject.motherRingId.motherRingId),
        isEmpty: false,
      },
    });
  } else {
    nodes.push(
      createEmptyNode("mother_2_2", { x: 500, y: 1372 }, "Grandmother (MP)", 2)
    );
  }


  edges.push({
    id: "mother_1-mother_2_2",
    source: "mother_1",
    target: "mother_2_2",
    type: "smoothstep",
    style: { stroke: "#37B7C3", strokeWidth: 2.5 },
  });


  // Generation 3 - Only if maxGeneration >= 3
  if (maxGeneration >= 3) {
    // Helper function to add generation 3 nodes with consistent edge pushing
    const addGen3Node = (
      parentPath,
      nodeId,
      position,
      defaultName,
      color,
      parentNodeId,
      isFromFather
    ) => {
      if (parentPath) {
        nodes.push({
          id: nodeId,
          type: "pigeonNode",
          position: position,
          data: {
            name: parentPath.name || defaultName,
            ringNumber: parentPath.ringNumber,
            owner: getBreederInfo(parentPath.breeder),
            country: parentPath.country,
            gender: getGender(parentPath.gender),
            generation: 3,
            position: nodeId,
            birthYear: parentPath.birthYear?.toString(),
            color: color,
            colorName: parentPath.color,
            // description: parentPath.notes || parentPath.shortInfo,
            achievements: formatResults(parentPath.addresults),
            verified: getPigeonVerification(parentPath),
            breederVerified: getBreederStatus(parentPath.breeder),
            iconic: getPigeonIconic(parentPath),
            iconicScore: getPigeonIconicScore(parentPath),
            isEmpty: false,
          },
        });
      } else {
        nodes.push(createEmptyNode(nodeId, position, nodeId, 3));
      }


      // Always push edge regardless of data
      const strokeColor = isFromFather ? "#37B7C3" : "#37B7C3";
      edges.push({
        id: `${parentNodeId}-${nodeId}`,
        source: parentNodeId,
        target: nodeId,
        type: "smoothstep",
        style: { stroke: strokeColor, strokeWidth: 2 },
      });
    };


    // Father side of father_2_1
    addGen3Node(
      subject.fatherRingId?.fatherRingId?.fatherRingId,
      "father_3_1",
      { x: 820, y: -200 },
      "Blue Prince",
      "#90EE90",
      "father_2_1",
      true
    );


    addGen3Node(
      subject.fatherRingId?.fatherRingId?.motherRingId,
      "mother_3_1",
      { x: 820, y: 60 },
      "Sapphire Queen",
      "#FFFFE0",
      "father_2_1",
      false
    );


    // Mother side of father_2_1
    addGen3Node(
      subject.fatherRingId?.motherRingId?.fatherRingId,
      "father_3_2",
      { x: 820, y: 320 },
      "Silver Storm",
      "#fff",
      "mother_2_1",
      true
    );


    addGen3Node(
      subject.fatherRingId?.motherRingId?.motherRingId,
      "mother_3_2",
      { x: 820, y: 580 },
      "Pearl Beauty",
      "#fff",
      "mother_2_1",
      false
    );


    // Father side of father_2_2
    addGen3Node(
      subject.motherRingId?.fatherRingId?.fatherRingId,
      "father_3_3",
      { x: 820, y: 850 },
      "Golden Eagle",
      "#fff",
      "father_2_2",
      true
    );


    addGen3Node(
      subject.motherRingId?.fatherRingId?.motherRingId,
      "mother_3_3",
      { x: 820, y: 1110 },
      "Amber Star",
      "#fff",
      "father_2_2",
      false
    );


    // Mother side of father_2_2
    addGen3Node(
      subject.motherRingId?.motherRingId?.fatherRingId,
      "father_3_4",
      { x: 820, y: 1370 },
      "Ruby King",
      "#90EE90",
      "mother_2_2",
      true
    );


    addGen3Node(
      subject.motherRingId?.motherRingId?.motherRingId,
      "mother_3_4",
      { x: 820, y: 1633 },
      "Crimson Rose",
      "#FFFFE0",
      "mother_2_2",
      false
    );
  }


  // Generation 4 - Only if role is PAIDUSER (maxGeneration === 4)
  if (maxGeneration === 4) {
    // Helper function to add generation 4 nodes with customizable bg colors
    const addGen4Node = (
      parentPath,
      nodeId,
      position,
      defaultName,
      fatherColor,
      motherColor
    ) => {
      if (parentPath && parentPath.fatherRingId) {
        nodes.push({
          id: `${nodeId}_father`,
          type: "pigeonNode",
          position: position.father,
          data: {
            name: parentPath.fatherRingId.name || `${defaultName} Father`,
            ringNumber: parentPath.fatherRingId.ringNumber,
            owner: getBreederInfo(parentPath.fatherRingId.breeder),
            country: parentPath.fatherRingId.country,
            gender: getGender(parentPath.fatherRingId.gender),
            generation: 4,
            position: `GG-GF (${nodeId})`,
            birthYear: parentPath.fatherRingId.birthYear?.toString(),
            color: fatherColor,
            colorName: parentPath.fatherRingId.color,
            verified: getPigeonVerification(parentPath.fatherRingId),
            breederVerified: getBreederStatus(parentPath.fatherRingId.breeder),
            iconic: getPigeonIconic(parentPath.fatherRingId),
            iconicScore: getPigeonIconicScore(parentPath.fatherRingId),
            isEmpty: false,
          },
        });
      } else {
        nodes.push({
          id: `${nodeId}_father`,
          type: "pigeonNode",
          position: position.father,
          data: {
            isEmpty: true,
            generation: 4,
          },
        });
      }


      edges.push({
        id: `${nodeId}-${nodeId}_father`,
        source: nodeId,
        target: `${nodeId}_father`,
        type: "smoothstep",
        style: { stroke: "#37B7C3", strokeWidth: 1.5 },
      });


      if (parentPath && parentPath.motherRingId) {
        nodes.push({
          id: `${nodeId}_mother`,
          type: "pigeonNode",
          position: position.mother,
          data: {
            name: parentPath.motherRingId.name || `${defaultName} Mother`,
            ringNumber: parentPath.motherRingId.ringNumber,
            owner: getBreederInfo(parentPath.motherRingId.breeder),
            country: parentPath.motherRingId.country,
            gender: getGender(parentPath.motherRingId.gender),
            generation: 4,
            position: `GG-GM (${nodeId})`,
            birthYear: parentPath.motherRingId.birthYear?.toString(),
            color: motherColor,
            colorName: parentPath.motherRingId.color,
            verified: getPigeonVerification(parentPath.motherRingId),
            breederVerified: getBreederStatus(parentPath.motherRingId.breeder),
            iconic: getPigeonIconic(parentPath.motherRingId),
            iconicScore: getPigeonIconicScore(parentPath.motherRingId),
            isEmpty: false,
          },
        });
      } else {
        nodes.push({
          id: `${nodeId}_mother`,
          type: "pigeonNode",
          position: position.mother,
          data: {
            isEmpty: true,
            generation: 4,
          },
        });
      }


      edges.push({
        id: `${nodeId}-${nodeId}_mother`,
        source: nodeId,
        target: `${nodeId}_mother`,
        type: "smoothstep",
        style: { stroke: "#37B7C3", strokeWidth: 1.5 },
      });
    };


    // Add all generation 4 nodes
    addGen4Node(
      subject.fatherRingId?.fatherRingId?.fatherRingId,
      "father_3_1",
      { father: { x: 1140, y: -200 }, mother: { x: 1140, y: -70 } },
      "Ancient",
      "#90EE90",
      "#90EE90"
    );
    addGen4Node(
      subject.fatherRingId?.fatherRingId?.motherRingId,
      "mother_3_1",
      { father: { x: 1140, y: 60 }, mother: { x: 1140, y: 190 } },
      "Storm",
      "#FFFFE0",
      "#FFFFE0"
    );
    addGen4Node(
      subject.fatherRingId?.motherRingId?.fatherRingId,
      "father_3_2",
      { father: { x:1140, y: 320 }, mother: { x:1140, y: 450 } },
      "Silver"
    );
    addGen4Node(
      subject.fatherRingId?.motherRingId?.motherRingId,
      "mother_3_2",
      { father: { x:1140, y: 580 }, mother: { x:1140, y: 710 } },
      "Purple"
    );
    addGen4Node(
      subject.motherRingId?.fatherRingId?.fatherRingId,
      "father_3_3",
      { father: { x:1140, y: 850 }, mother: { x:1140, y: 980 } },
      "Golden"
    );
    addGen4Node(
      subject.motherRingId?.fatherRingId?.motherRingId,
      "mother_3_3",
      { father: { x:1140, y: 1110 }, mother: { x:1140, y: 1240 } },
      "Ruby"
    );
    addGen4Node(
      subject.motherRingId?.motherRingId?.fatherRingId,
      "father_3_4",
      { father: { x:1140, y: 1370 }, mother: { x:1140, y: 1500 } },
      "Crimson",
      "#90EE90",
      "#90EE90"
    );
    addGen4Node(
      subject.motherRingId?.motherRingId?.motherRingId,
      "mother_3_4",
      { father: { x:1140, y: 1630 }, mother: { x:1140, y: 1760 } },
      "Scarlet",
      "#FFFFE0",
      "#FFFFE0"
    );
  }


  // Return result
  return { nodes, edges };
};



