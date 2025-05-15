import { toast } from "sonner";

import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useAuth } from "@clerk/clerk-react";
import { customFetch } from "@/utils/customAxios";

const Test = () => {
  const { getToken, isSignedIn, userId, orgRole, orgId } = useAuth();

  console.log(userId);

  console.log(orgRole);

  console.log(orgId);

  return (
    <>
      <Card>
        <Button
          size={"sm"}
          className={"w-50"}
          onClick={async () => {
            try {
              const token = await getToken();
              console.log(
                await window.Clerk.session.getToken({
                  template: "app",
                })
              );

              if (!token) {
                const data = await customFetch.get("/");
                console.log(data);
                toast("Success", {
                  description: "Connect to backend success 😊😊😊",
                  action: {
                    label: "Oke",
                    onClick: () => console.log("Undo"),
                  },
                });
              } else {
                const data = await customFetch.post("/check");
                console.log(data);
                toast("connect to backend success", {
                  description: "Connect to backend success 😊😊😊",
                  action: {
                    label: "Oke",
                    onClick: () => console.log("Undo"),
                  },
                });
              }
            } catch (error) {
              console.log(error.response?.data?.error);
              const messageError = error.response?.data?.error ?? "error";

              if (messageError) {
                toast(messageError, {
                  description: "Something wrong 😢😢😢",
                  action: {
                    label: ":(((",
                    onClick: () => console.log("Undo"),
                  },
                });
              }
            }
          }}
        >
          Check health system
        </Button>
      </Card>
    </>
  );
};

export default Test;
