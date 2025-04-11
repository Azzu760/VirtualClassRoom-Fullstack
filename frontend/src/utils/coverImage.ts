const coverImages: { keywords: string[]; image: string }[] = [
  {
    keywords: ["Mathematics", "Algebra", "Calculus"],
    image:
      "https://img.freepik.com/free-photo/top-view-school-supplies-table-assortment_23-2148939207.jpg?t=st=1742800874~exp=1742804474~hmac=e0058adf52c7f8e9ade60312a0f92ab517a1c40ca971ac16586c6cbba28e78da&w=1380",
  },
  {
    keywords: ["Engineering", "Mechanics", "Fluid"],
    image:
      "https://img.freepik.com/free-photo/blue-school-drawing-supplies-set_23-2147843324.jpg?t=st=1742801067~exp=1742804667~hmac=4cd6f9083c4035e484c88ce9745b32773f4ae3d3e410e22ca149415e8df8a75f&w=1380",
  },
  {
    keywords: ["Data", "Algorithms", "Programming"],
    image:
      "https://img.freepik.com/free-vector/data-concept-illustration-idea-collecting-analysing-using_613284-1574.jpg?t=st=1742801298~exp=1742804898~hmac=6421cc7176550aa0fbfbaba37ddb1c3c1b0a33595d99a5644764e403fb7ec904&w=1380",
  },
  {
    keywords: ["Science", "Physics", "Chemistry"],
    image:
      "https://img.freepik.com/free-vector/scientific-research-twitch-banner_23-2150199120.jpg?t=st=1742801123~exp=1742804723~hmac=61b3bbe408896fd5c6787728654cf97e9629c6ccf434d798b06071cc7182af4b&w=1380",
  },
  {
    keywords: ["History", "Geography"],
    image:
      "https://img.freepik.com/free-photo/earth-day-environment-eco-concept-space-text_185193-110608.jpg?t=st=1742801535~exp=1742805135~hmac=429987cdb68bf09c755d3adaa25be1c827b4b166e78617dfeaf8e31fe67a0e1e&w=1380",
  },
  {
    keywords: ["English", "Literature"],
    image:
      "https://img.freepik.com/free-photo/waistup-portrait-redhead-female-student-write-down-thoughts-red-lovely-notebook-prepare-grocery-l_1258-126257.jpg?t=st=1742801765~exp=1742805365~hmac=4380eaae0139e75140f43a709a75248da7f4558cb374cbb911f2c52cf8640759&w=1380",
  },
  {
    keywords: ["Art", "Design", "Creativity"],
    image:
      "https://img.freepik.com/free-photo/semicircle-from-painting-supplies_23-2147710368.jpg?t=st=1742801858~exp=1742805458~hmac=65bc7b68d631bd4c44cd6332222b037db93324f467cd80cc4dea689df30d5ae1&w=1380",
  },
];

export const getCoverImage = (subject: string): string => {
  for (const { keywords, image } of coverImages) {
    if (
      keywords.some((keyword) =>
        subject.toLowerCase().includes(keyword.toLowerCase())
      )
    ) {
      return image;
    }
  }
  return "https://img.freepik.com/free-photo/flat-lay-arrangement-desk-elements-with-copy-space_23-2148513316.jpg?t=st=1742802121~exp=1742805721~hmac=fc5d3ff8ba88b1b2899907ff1d3a90032f9e7cd14ef302e3bbad608c63265ac6&w=1380";
};
