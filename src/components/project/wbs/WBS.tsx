import AllWBS from "./AllWBS";

const WBS = ({id, wbsData}: {id: string, wbsData: any}) => {
    console.log(id);
    
    return (<>
      <AllWBS id={id} wbsData={wbsData}/>
    </>);
};

export default WBS;
