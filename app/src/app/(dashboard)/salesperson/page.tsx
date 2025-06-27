import DealsHeader from "@/components/dashboard/salesperson/deals/DealsHeader";
import DealsTable from "@/components/dashboard/salesperson/deals/DealsTable";

export default function SalespersonDashboard() {
  return (
    <div>
      <DealsHeader
        PageTitle="Deal Managment"
        PageDescription="Manage your user base, teams and access all the details of each user."
      />
      <DealsTable />
      {/* <DropDown /> */}
    </div>
  );
}
