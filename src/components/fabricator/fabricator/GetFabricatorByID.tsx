import { useEffect } from "react";
import Service from "../../../api/Service";



interface GetFabricatorIDProps{
  id:string
}
const GetFabricatorByID = ({ id }: GetFabricatorIDProps) => {

  
  useEffect(() => {
    const FetchFabById = async () => {
      try {
        const response = await Service.FetchFabricatorById (id);
        console.log(response);

      
      }
      catch (error) {
      
        console.error("Failed to fetch fabricators:", error);
      }
    }
    FetchFabById();
  },[]
)

  return <div>GetFabricatorByID :{id}</div>;
};

export default GetFabricatorByID