import AllWBS from "./AllWBS";

const WBS = ({ id, stage }: { id: string; stage: string }) => {
  console.log(id);

  return (
    <>
      <AllWBS id={id} stage={stage} />
    </>
  );
};

export default WBS;
