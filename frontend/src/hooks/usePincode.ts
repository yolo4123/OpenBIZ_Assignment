import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
export function usePincodeAutoFill(form: UseFormReturn<any>) {
  useEffect(() => {
    const sub = form.watch((values, { name }) => {
      if (name === "pincode" && /^[1-9][0-9]{5}$/.test(values.pincode || "")) {
        fetch(`https://api.postalpincode.in/pincode/${values.pincode}`)
          .then(r => r.json())
          .then(data => {
            if (data[0]?.Status === "Success") {
              const po = data[0].PostOffice?.[0];
              if (po) {
                form.setValue("city", po.Block || po.District || "");
                form.setValue("state", po.State || "");
              }
            }
          })
          .catch(()=>{});
      }
    });
    return () => sub.unsubscribe();
  }, [form]);
}