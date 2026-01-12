import AllWBS from "./AllWBS";

const WBS = ({
  id,
  wbsData,
  stage,
}: {
  id: string;
  wbsData: any;
  stage: string;
}) => {
  console.log(id);

  return (
    <>
      <AllWBS id={id} stage={stage} />
    </>
  );
};

export default WBS;
