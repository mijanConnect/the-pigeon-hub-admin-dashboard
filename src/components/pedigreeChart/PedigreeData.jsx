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

  // Determine max generation based on role
  const maxGeneration = role === "SUPER_ADMIN" || role === "ADMIN" ? 4 : 4;

  // Helper function to format results
  // const formatResults = (results) => {
  //   if (!Array.isArray(results) || results.length === 0) return null;
  //   const firstResult = results[0];
  //   return `${firstResult.name || ""}: ${firstResult.place || ""} (${
  //     firstResult.date ? new Date(firstResult.date).getFullYear() : ""
  //   })`;
  // };

  const formatResults = (results) => {
    if (!results || typeof results !== "string" || results.trim() === "")
      return null;
    return results;
  };

  // Helper function to get gender from data
  const getGender = (genderData) => {
    if (typeof genderData === "string") {
      return genderData.toLowerCase() === "hen" ? "Hen" : "Cock";
    }
    return "Cock";
  };

  // Helper function to get breeder name with status check
  const getBreederInfo = (breeder) => {
    if (typeof breeder === "object" && breeder) {
      const name = breeder.breederName;
      return name;
    }
    return breeder;
  };

  // Helper function to get consistent breeder verification status
  const getBreederVerification = (breeder) => {
    if (typeof breeder === "object" && breeder) {
      return breeder.verified === true;
    }
    return false;
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
      description:
        subject.notes || subject.shortInfo || "No description available",
      achievements: formatResults(subject.addresults),
      verified: getBreederVerification(subject.breeder),
      handles: "top-bottom",
      isEmpty: false,
    },
  });

  // Generation 1 - Father
  if (subject.fatherRingId) {
    nodes.push({
      id: "father_1",
      type: "pigeonNode",
      position: { x: 320, y: -200 },
      data: {
        name: subject.fatherRingId.name || "Unknown Father",
        ringNumber: subject.fatherRingId.ringNumber,
        owner: getBreederInfo(subject.fatherRingId.breeder),
        country: subject.fatherRingId.country,
        gender: getGender(subject.fatherRingId.gender),
        generation: 1,
        position: "Father",
        birthYear: subject.fatherRingId.birthYear?.toString(),
        color: "#ADD8E6",
        colorName: subject.fatherRingId.color,
        description:
          subject.fatherRingId.notes ||
          subject.fatherRingId.shortInfo ||
          "No description available",
        achievements: formatResults(subject.fatherRingId.addresults),
        verified: getBreederVerification(subject.fatherRingId.breeder),
        handles: "right-only",
        isEmpty: false,
      },
    });
  } else {
    nodes.push(createEmptyNode("father_1", { x: 320, y: -200 }, "Father", 1));
  }

  edges.push({
    id: "subject-father_1",
    source: "subject",
    target: "father_1",
    type: "smoothstep",
    style: { stroke: "#3b82f6", strokeWidth: 3 },
    curveness: 0.1,
  });

  // Generation 1 - Mother
  if (subject.motherRingId) {
    nodes.push({
      id: "mother_1",
      type: "pigeonNode",
      position: { x: 320, y: window.screen?.height - -130 || 1000 },
      data: {
        name: subject.motherRingId.name || "Unknown Mother",
        ringNumber: subject.motherRingId.ringNumber,
        owner: getBreederInfo(subject.motherRingId.breeder),
        country: subject.motherRingId.country,
        gender: getGender(subject.motherRingId.gender),
        generation: 1,
        position: "Mother",
        birthYear: subject.motherRingId.birthYear?.toString(),
        color: "#fff",
        colorName: subject.motherRingId.color,
        description:
          subject.motherRingId.notes ||
          subject.motherRingId.shortInfo ||
          "No description available",
        achievements: formatResults(subject.motherRingId.addresults),
        verified: getBreederVerification(subject.motherRingId.breeder),
        handles: "right-only",
        isEmpty: false,
      },
    });

    edges.push({
      id: "subject-mother_1",
      source: "subject",
      target: "mother_1",
      type: "smoothstep",
      style: { stroke: "#ec4899", strokeWidth: 3 },
    });
  } else {
    nodes.push(
      createEmptyNode(
        "mother_1",
        { x: 320, y: window.screen?.height - -130 || 1000 },
        "Mother",
        1
      )
    );
    edges.push({
      id: "subject-mother_1",
      source: "subject",
      target: "mother_1",
      type: "smoothstep",
      style: { stroke: "#ec4899", strokeWidth: 3 },
    });
  }

  // Generation 2 - Grandparents
  // Father side - Grandfather (FP)
  if (subject.fatherRingId?.fatherRingId) {
    nodes.push({
      id: "father_2_1",
      type: "pigeonNode",
      position: { x: 640, y: -200 },
      data: {
        name: subject.fatherRingId.fatherRingId.name || "Unknown GF (FP)",
        ringNumber: subject.fatherRingId.fatherRingId.ringNumber,
        owner: getBreederInfo(subject.fatherRingId.fatherRingId.breeder),
        country: subject.fatherRingId.fatherRingId.country,
        gender: getGender(subject.fatherRingId.fatherRingId.gender),
        generation: 2,
        position: "Grandfather (FP)",
        birthYear: subject.fatherRingId.fatherRingId.birthYear?.toString(),
        color: "#fff",
        colorName: subject.fatherRingId.fatherRingId.color || "Blue",
        description:
          subject.fatherRingId.fatherRingId.notes ||
          subject.fatherRingId.fatherRingId.shortInfo ||
          "Top racing cock.",
        achievements:
          formatResults(subject.fatherRingId.fatherRingId.addresults) ||
          "Multiple race winner",
        verified: getBreederVerification(
          subject.fatherRingId.fatherRingId.breeder
        ),
        isEmpty: false,
      },
    });
  } else {
    nodes.push(
      createEmptyNode("father_2_1", { x: 640, y: -200 }, "Grandfather (FP)", 2)
    );
  }

  edges.push({
    id: "father_1-father_2_1",
    source: "father_1",
    target: "father_2_1",
    type: "smoothstep",
    style: { stroke: "#3b82f6", strokeWidth: 2.5 },
  });

  // Father side - Grandmother (FP)
  if (subject.fatherRingId?.motherRingId) {
    nodes.push({
      id: "mother_2_1",
      type: "pigeonNode",
      position: { x: 640, y: 330 },
      data: {
        name: subject.fatherRingId.motherRingId.name || "Unknown GM (FP)",
        ringNumber: subject.fatherRingId.motherRingId.ringNumber,
        owner: getBreederInfo(subject.fatherRingId.motherRingId.breeder),
        country: subject.fatherRingId.motherRingId.country,
        gender: getGender(subject.fatherRingId.motherRingId.gender),
        generation: 2,
        position: "Grandmother (FP)",
        birthYear: subject.fatherRingId.motherRingId.birthYear?.toString(),
        color: "#fff",
        colorName: subject.fatherRingId.motherRingId.color || "Sky Blue",
        description:
          subject.fatherRingId.motherRingId.notes ||
          subject.fatherRingId.motherRingId.shortInfo ||
          "Excellent breeding hen.",
        achievements:
          formatResults(subject.fatherRingId.motherRingId.addresults) ||
          "Top producer",
        verified: getBreederVerification(
          subject.fatherRingId.motherRingId.breeder
        ),
        isEmpty: false,
      },
    });
  } else {
    nodes.push(
      createEmptyNode("mother_2_1", { x: 640, y: 330 }, "Grandmother (FP)", 2)
    );
  }

  edges.push({
    id: "father_1-mother_2_1",
    source: "father_1",
    target: "mother_2_1",
    type: "smoothstep",
    style: { stroke: "#ec4899", strokeWidth: 2.5 },
  });

  // Mother side - Grandfather (MP)
  if (subject.motherRingId?.fatherRingId) {
    nodes.push({
      id: "father_2_2",
      type: "pigeonNode",
      position: { x: 640, y: 870 },
      data: {
        name: subject.motherRingId.fatherRingId.name || "Unknown GF (MP)",
        ringNumber: subject.motherRingId.fatherRingId.ringNumber,
        owner: getBreederInfo(subject.motherRingId.fatherRingId.breeder),
        country: subject.motherRingId.fatherRingId.country,
        gender: getGender(subject.motherRingId.fatherRingId.gender),
        generation: 2,
        position: "Grandfather (MP)",
        birthYear: subject.motherRingId.fatherRingId.birthYear?.toString(),
        color: "#fff",
        colorName: subject.motherRingId.fatherRingId.color || "Royal Blue",
        description:
          subject.motherRingId.fatherRingId.notes ||
          subject.motherRingId.fatherRingId.shortInfo ||
          "Champion racer.",
        achievements:
          formatResults(subject.motherRingId.fatherRingId.addresults) ||
          "National ace",
        verified: getBreederVerification(
          subject.motherRingId.fatherRingId.breeder
        ),
        isEmpty: false,
      },
    });
  } else {
    nodes.push(
      createEmptyNode("father_2_2", { x: 640, y: 870 }, "Grandfather (MP)", 2)
    );
  }

  edges.push({
    id: "mother_1-father_2_2",
    source: "mother_1",
    target: "father_2_2",
    type: "smoothstep",
    style: { stroke: "#3b82f6", strokeWidth: 2.5 },
  });

  // Mother side - Grandmother (MP)
  if (subject.motherRingId?.motherRingId) {
    nodes.push({
      id: "mother_2_2",
      type: "pigeonNode",
      position: { x: 640, y: 1400 },
      data: {
        name: subject.motherRingId.motherRingId.name || "Unknown GM (MP)",
        ringNumber: subject.motherRingId.motherRingId.ringNumber,
        owner: getBreederInfo(subject.motherRingId.motherRingId.breeder),
        country: subject.motherRingId.motherRingId.country,
        gender: getGender(subject.motherRingId.motherRingId.gender),
        generation: 2,
        position: "Grandmother (MP)",
        birthYear: subject.motherRingId.motherRingId.birthYear?.toString(),
        color: "#fff",
        colorName: subject.motherRingId.motherRingId.color || "Powder Blue",
        description:
          subject.motherRingId.motherRingId.notes ||
          subject.motherRingId.motherRingId.shortInfo ||
          "Foundation hen.",
        achievements:
          formatResults(subject.motherRingId.motherRingId.addresults) ||
          "Mother of champions",
        verified: getBreederVerification(
          subject.motherRingId.motherRingId.breeder
        ),
        isEmpty: false,
      },
    });
  } else {
    nodes.push(
      createEmptyNode("mother_2_2", { x: 640, y: 1400 }, "Grandmother (MP)", 2)
    );
  }

  edges.push({
    id: "mother_1-mother_2_2",
    source: "mother_1",
    target: "mother_2_2",
    type: "smoothstep",
    style: { stroke: "#ec4899", strokeWidth: 2.5 },
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
            description:
              parentPath.notes ||
              parentPath.shortInfo ||
              "No description available",
            achievements: formatResults(parentPath.addresults),
            verified: getBreederVerification(parentPath.breeder),
            isEmpty: false,
          },
        });
      } else {
        nodes.push(createEmptyNode(nodeId, position, nodeId, 3));
      }

      // Always push edge regardless of data
      const strokeColor = isFromFather ? "#3b82f6" : "#ec4899";
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
      { x: 960, y: -200 },
      "Blue Prince",
      "#90EE90",
      "father_2_1",
      true
    );

    addGen3Node(
      subject.fatherRingId?.fatherRingId?.motherRingId,
      "mother_3_1",
      { x: 960, y: 60 },
      "Sapphire Queen",
      "#FFFFE0",
      "father_2_1",
      false
    );

    // Mother side of father_2_1
    addGen3Node(
      subject.fatherRingId?.motherRingId?.fatherRingId,
      "father_3_2",
      { x: 960, y: 330 },
      "Silver Storm",
      "#fff",
      "mother_2_1",
      true
    );

    addGen3Node(
      subject.fatherRingId?.motherRingId?.motherRingId,
      "mother_3_2",
      { x: 960, y: 590 },
      "Pearl Beauty",
      "#fff",
      "mother_2_1",
      false
    );

    // Father side of father_2_2
    addGen3Node(
      subject.motherRingId?.fatherRingId?.fatherRingId,
      "father_3_3",
      { x: 960, y: 870 },
      "Golden Eagle",
      "#fff",
      "father_2_2",
      true
    );

    addGen3Node(
      subject.motherRingId?.fatherRingId?.motherRingId,
      "mother_3_3",
      { x: 960, y: 1130 },
      "Amber Star",
      "#fff",
      "father_2_2",
      false
    );

    // Mother side of father_2_2
    addGen3Node(
      subject.motherRingId?.motherRingId?.fatherRingId,
      "father_3_4",
      { x: 960, y: 1400 },
      "Ruby King",
      "#90EE90",
      "mother_2_2",
      true
    );

    addGen3Node(
      subject.motherRingId?.motherRingId?.motherRingId,
      "mother_3_4",
      { x: 960, y: 1660 },
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
            verified: parentPath.fatherRingId.verified || false,
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
        style: { stroke: "#3b82f6", strokeWidth: 1.5 },
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
            verified: parentPath.motherRingId.verified || false,
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
        style: { stroke: "#ec4899", strokeWidth: 1.5 },
      });
    };

    // Add all generation 4 nodes
    addGen4Node(
      subject.fatherRingId?.fatherRingId?.fatherRingId,
      "father_3_1",
      { father: { x: 1280, y: -200 }, mother: { x: 1280, y: -70 } },
      "Ancient",
      "#90EE90",
      "#90EE90"
    );
    addGen4Node(
      subject.fatherRingId?.fatherRingId?.motherRingId,
      "mother_3_1",
      { father: { x: 1280, y: 60 }, mother: { x: 1280, y: 190 } },
      "Storm",
      "#FFFFE0",
      "#FFFFE0"
    );
    addGen4Node(
      subject.fatherRingId?.motherRingId?.fatherRingId,
      "father_3_2",
      { father: { x: 1280, y: 330 }, mother: { x: 1280, y: 460 } },
      "Silver"
    );
    addGen4Node(
      subject.fatherRingId?.motherRingId?.motherRingId,
      "mother_3_2",
      { father: { x: 1280, y: 590 }, mother: { x: 1280, y: 720 } },
      "Purple"
    );
    addGen4Node(
      subject.motherRingId?.fatherRingId?.fatherRingId,
      "father_3_3",
      { father: { x: 1280, y: 870 }, mother: { x: 1280, y: 1000 } },
      "Golden"
    );
    addGen4Node(
      subject.motherRingId?.fatherRingId?.motherRingId,
      "mother_3_3",
      { father: { x: 1280, y: 1130 }, mother: { x: 1280, y: 1260 } },
      "Ruby"
    );
    addGen4Node(
      subject.motherRingId?.motherRingId?.fatherRingId,
      "father_3_4",
      { father: { x: 1280, y: 1400 }, mother: { x: 1280, y: 1530 } },
      "Crimson",
      "#90EE90",
      "#90EE90"
    );
    addGen4Node(
      subject.motherRingId?.motherRingId?.motherRingId,
      "mother_3_4",
      { father: { x: 1280, y: 1660 }, mother: { x: 1280, y: 1790 } },
      "Scarlet",
      "#FFFFE0",
      "#FFFFE0"
    );
  }

  // Return result
  return { nodes, edges };
};
