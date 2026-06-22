/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector, useDispatch } from "react-redux";
import { closeDetailView } from "../../store/uiSlice";
import GetSubmittalByID from "../submittals/GetSubmittalByID";
import GetRFIByID from "../rfi/GetRFIByID";
import GetRFQByID from "../rfq/GetRFQByID";
import GetMilestoneByID from "../project/mileStone/GetMilestoneByID";
import FetchTaskByID from "../task/FetchTaskByID";
import GetProjectById from "../project/GetProjectById";
import GetCOByID from "../co/GetCOByID";
import GetInternalRFQByID from "../rfq/GetInternalRFQByID";
import ConnectionDesignerQuotaByID from "../connectionDesigner/ConnectionDesignerQuotaByID";
import GetCDRFQByID from "../connectionDesigner/GetCDRFQByID";

const GlobalDetailView = () => {
  const dispatch = useDispatch();
  const { type, id, projectId } = useSelector((state: any) => state.ui.activeDetailView);

  console.log("Rendering GlobalDetailView", { type, id, projectId });

  if (type === null || id === null || id === undefined) return null;

  const handleClose = () => {
    dispatch(closeDetailView());
  };

  switch (type) {
    case "SUBMITTAL":
      return <GetSubmittalByID id={id} onClose={handleClose} />;
    case "RFI":
      return <GetRFIByID id={id} onClose={handleClose} />;
    case "RFQ":
      return <GetRFQByID id={id} onClose={handleClose} />;
    case "INTERNAL_RFQ":
      return <GetInternalRFQByID id={id} onClose={handleClose} />;
    case "CD_QUOTA":
      return <ConnectionDesignerQuotaByID id={id} close={handleClose} />;
    case "CD_RFQ":
      return <GetCDRFQByID id={id} onClose={handleClose} />;
    case "MILESTONE":
      return <GetMilestoneByID row={{ id }} close={handleClose} />;
    case "TASK":
      return <FetchTaskByID id={id} onClose={handleClose} />;
    case "PROJECT":
      return <GetProjectById id={id?.toString()} close={handleClose} />;
    case "CHANGE_ORDER":
      return <GetCOByID id={id?.toString()} projectId={projectId?.toString()} onClose={handleClose} />;
    default:
      return null;
  }
};

export default GlobalDetailView;
