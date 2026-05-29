'use client'

import { motion } from 'framer-motion'
import { Bus, MapPin, User, Phone } from 'lucide-react'
import { BUS_ROUTES, STUDENTS } from '@/lib/mock-school-data'

export default function TransportPage() {
  const studentsWithBus = STUDENTS.filter(s => s.busRoute)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">Transport Management</h2>
        <p className="text-sm text-muted-foreground">{BUS_ROUTES.length} routes · {studentsWithBus.length} students using bus</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{BUS_ROUTES.length}</p>
          <p className="text-xs text-muted-foreground">Active Routes</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{BUS_ROUTES.reduce((acc, r) => acc + r.studentsCount, 0)}</p>
          <p className="text-xs text-muted-foreground">Students Enrolled</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-extrabold text-foreground">{BUS_ROUTES.length}</p>
          <p className="text-xs text-muted-foreground">Buses</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BUS_ROUTES.map((route, i) => (
          <motion.div key={route.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border bg-navy-900 dark:bg-navy-800 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-gold-400" />
                  <span className="font-bold text-white">{route.name}</span>
                </div>
                <span className="text-xs font-bold text-gold-400">{route.busNo}</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground">{route.driver}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{route.driverPhone}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Students</span>
                <span className="font-semibold text-foreground">{route.studentsCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-semibold text-foreground">{route.busCapacity} seats</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">Stops</p>
                <div className="space-y-1">
                  {route.stops.slice(0, 4).map((stop, si) => (
                    <div key={si} className="flex items-center gap-2 text-xs">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-foreground">{stop.name}</span>
                      <span className="text-muted-foreground ml-auto">{stop.time}</span>
                    </div>
                  ))}
                  {route.stops.length > 4 && <p className="text-xs text-muted-foreground pl-5">+{route.stops.length - 4} more stops</p>}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
