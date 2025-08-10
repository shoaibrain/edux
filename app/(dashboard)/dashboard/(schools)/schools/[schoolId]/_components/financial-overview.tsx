import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet } from "lucide-react"

const financialData = [
  {
    category: "Tuition Revenue",
    amount: "$89,500",
    change: "+12.5%",
    changeType: "increase",
    percentage: 72,
  },
  {
    category: "Government Funding",
    amount: "$25,000",
    change: "+5.2%",
    changeType: "increase",
    percentage: 20,
  },
  {
    category: "Other Income",
    amount: "$10,000",
    change: "-2.1%",
    changeType: "decrease",
    percentage: 8,
  },
]

const expenses = [
  { category: "Staff Salaries", amount: "$65,000", percentage: 65 },
  { category: "Facilities", amount: "$15,000", percentage: 15 },
  { category: "Resources", amount: "$12,000", percentage: 12 },
  { category: "Other", amount: "$8,000", percentage: 8 },
]

export function FinancialOverview() {
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-green-600" />
          Financial Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Wallet className="h-4 w-4 mr-2 text-green-500" />
              Revenue Sources
            </h4>
            <div className="space-y-3">
              {financialData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.amount}</span>
                      <Badge variant={item.changeType === "increase" ? "default" : "destructive"} className="text-xs">
                        {item.changeType === "increase" ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {item.change}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <CreditCard className="h-4 w-4 mr-2 text-red-500" />
              Expense Categories
            </h4>
            <div className="space-y-3">
              {expenses.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.category}</span>
                    <span className="font-medium">{item.amount}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-gray-600">Net Income: </span>
              <span className="font-semibold text-green-600">$24,500</span>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Profit Margin: 19.7%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
