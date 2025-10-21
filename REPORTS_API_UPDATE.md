# Reports API Response Structure - Update

## 🔄 API Response Structure Clarification

The actual `/api/reports/overview` API response has a **nested structure** that differs from the initial implementation. The component has been updated to handle this correctly.

### Actual API Response Structure

```typescript
{
  success: true,
  data: {
    // NESTED STRUCTURE - Array of departments with time-series data
    visitsOverTime: [
      {
        departmentId: "68f7e996d1d6afb935c7e0fe",
        departmentName: "General Medicine",
        points: [  // Each department has its own time-series points
          {
            bucketStart: "2025-07-24T18:30:00.000Z",  // Note: bucketStart, not date
            visits: 3,
            avgWaitSeconds: 0,
            peakHour: "12:00"
          },
          // ... more points
        ]
      },
      // ... more departments
    ],
    
    // Top departments - Simple array
    topDepartments: [
      {
        departmentId: "68f7e996d1d6afb935c7e0f8",
        departmentName: "Cardiology",
        visits: 26
      },
      // ... more departments
    ],
    
    // Summary KPIs
    summary: {
      totalVisits: 115,
      avgWaitSeconds: 0,
      peakHour: "08:00"
    },
    
    // Table data - Flat array
    table: {
      rows: [
        {
          date: "2025-07-24T18:30:00.000Z",  // ISO timestamp
          department: "Cardiology",           // String name, not object
          visits: 3,
          avgWaitSeconds: 0,
          peakHour: "08:00"
        },
        // ... more rows
      ],
      pagination: {
        page: 1,
        limit: 25,
        total: 39,
        pages: 2
      }
    }
  }
}
```

## ✅ Updates Made to Reports.tsx

### 1. **Line Chart Data Processing**
Updated to handle the nested `visitsOverTime` structure:

```typescript
// OLD (incorrect):
const data = reportData.visitsOverTime  // Expected flat array
const maxVisits = Math.max(...data.map((d: any) => d.visits))

// NEW (correct):
// Flatten the nested structure - aggregate all departments' visits by date
const dateMap = new Map<string, number>()

reportData.visitsOverTime.forEach((dept: any) => {
  dept.points?.forEach((point: any) => {
    const date = point.bucketStart  // Use bucketStart field
    const currentVisits = dateMap.get(date) || 0
    dateMap.set(date, currentVisits + point.visits)
  })
})

// Convert to array and sort by date
const data = Array.from(dateMap.entries())
  .map(([date, visits]) => ({ date, visits }))
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
```

**Key Changes:**
- Loops through each department's `points` array
- Uses `bucketStart` field for dates (not `date`)
- Aggregates visits from all departments by date
- Sorts data chronologically

### 2. **Table Data Rendering**
Updated to use correct field names:

```typescript
// OLD (incorrect):
<td>{row.date}</td>
<td>{row.departmentName}</td>

// NEW (correct):
<td>{new Date(row.date).toLocaleDateString()}</td>
<td>{row.department}</td>
```

**Key Changes:**
- Table uses `department` (string) not `departmentName`
- Date is formatted using `toLocaleDateString()`
- Date field is an ISO timestamp string

### 3. **Bar Chart Data**
No changes needed - `topDepartments` structure was already correct:
```typescript
topDepartments: [
  { departmentId, departmentName, visits }
]
```

## 📊 How the Data Flows

### Visits Over Time Chart

```
API Response (nested by department)
  ↓
visitsOverTime: [
  { departmentName: "Cardiology", points: [...] },
  { departmentName: "Emergency", points: [...] }
]
  ↓
Flatten and Aggregate by Date
  ↓
Map<date, totalVisits>
  ↓
[
  { date: "2025-07-24", visits: 19 },  // Sum of all departments
  { date: "2025-07-25", visits: 11 }
]
  ↓
Plot on Line Chart
```

### Top Departments Chart

```
API Response (already aggregated)
  ↓
topDepartments: [
  { departmentName: "Cardiology", visits: 26 },
  { departmentName: "Pediatrics", visits: 20 }
]
  ↓
Map to Bar Chart
```

### Table Display

```
API Response (flat rows)
  ↓
table.rows: [
  { date: "2025-07-24", department: "Cardiology", visits: 3 }
]
  ↓
Format Date & Display
```

## 🎯 Why This Structure?

The nested structure in `visitsOverTime` allows the API to:
1. **Provide per-department time-series data** (useful for multi-line charts)
2. **Support department-specific analysis** in future features
3. **Reduce data transfer** by avoiding redundant department info
4. **Enable flexible aggregation** on the client side

## ✨ Benefits of the Update

✅ **Correct Data Display**: Charts now show accurate aggregated data
✅ **Date Handling**: Properly uses `bucketStart` field
✅ **Table Format**: Correctly displays department names and formatted dates
✅ **Future-Proof**: Can easily add per-department line charts if needed

## 🔮 Future Enhancements

With this nested structure, we can easily add:

1. **Multi-Line Chart**: Show each department as a separate line
   ```typescript
   // Each department gets its own line
   reportData.visitsOverTime.forEach(dept => {
     const points = dept.points.map(p => ({ x, y }))
     // Draw line for this department
   })
   ```

2. **Department-Specific Views**: Filter to show only one department's trends

3. **Comparison Views**: Compare two departments side-by-side

4. **Stacked Area Chart**: Show department breakdown over time

## 📝 Testing with Real Data

The component has been tested with the actual API response structure:
- ✅ 115 total visits across 6 departments
- ✅ 7 days of data (July 24-30, 2025)
- ✅ 39 table rows with pagination (25 per page)
- ✅ Top 5 departments correctly displayed
- ✅ Line chart aggregates all departments
- ✅ Dates formatted correctly

## 🎉 Status

✅ **Component Updated**: Reports.tsx works with actual API
✅ **No Linter Errors**: Clean code
✅ **Tested**: Verified with real API response
✅ **Production Ready**: Ready for deployment

---

**Updated**: October 2025
**Status**: ✅ Complete
**Zero Errors**: ✅

