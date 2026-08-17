import { useQuery } from "@tanstack/react-query";
import { getCalibrations } from "../services/calibrationApi";

export const useCalibrations = (params = {}) => {
  return useQuery({
    queryKey: ["calibrations", params],
    queryFn: async () => {
      const response = await getCalibrations(params);
      return response.data;
    }
  });
};
